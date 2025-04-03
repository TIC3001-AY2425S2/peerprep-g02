import SearchIcon from '@mui/icons-material/Search';
import { Button, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import NavBar from '../../components/navbar';
import { useAuth } from '../../context/authcontext';
import { getCollab } from '../../hooks/collab/collab';
import { cancelMatchmaking } from '../../hooks/matching/matching';
import pageNavigation from '../../hooks/navigation/pageNavigation';
import { MatchingStatusEnum } from '../../types/matching';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const REDIRECT_TIMEOUT = 3000; // 3 seconds countdown to redirect to homepage.

const Matching = () => {
  const { user, sessionId, setCollab } = useAuth();
  const { goToHomePage, goToCollabPage } = pageNavigation();
  const [matchStatus, setMatchStatus] = useState<MatchingStatusEnum | ''>(MatchingStatusEnum.WAITING);
  const [countdown, setCountdown] = useState<number | ''>('');
  const [statusMessage, setStatusMessage] = useState<string>();
  const userId = user.id;

  useEffect(() => {
    const socket = io(BASE_URL, { path: '/matching/websocket' });
    if (!socket.connected) {
      console.log('Running connect');
      socket.connect();
    }

    socket.on('connect', () => {
      toast.success(`Connected to server with socket ID: ${socket.id}`);
    });

    socket.on('matchmaking status', (data) => {
      // console.log('Received matchmaking status from server: ', data);
      // Prevent further updates when matched.
      if (data.status === MatchingStatusEnum.MATCHED) {
        socket.disconnect();
      }
      setMatchStatus(data.status);
      setCountdown(data.timer);
    });

    // Set up an interval to emit status requests every second.
    const intervalId = setInterval(() => {
      if (socket.connected) {
        socket.emit('matchmaking status', socket.id, { userId, sessionId });
      }
    }, 1000);

    // When User refreshes or closes/navigates away from the page we disconnect the socket.
    const handleBeforeUnload = () => {
      console.log('Running handleBeforeUnlock');
      socket.disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup both the socket listeners and the interval on unmount.
    return () => {
      console.log('Running off connect and status');
      clearInterval(intervalId);
      handleBeforeUnload();
      socket.off('connect');
      socket.off('matchmaking status');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleMatchCancelled = async () => {
    await cancelMatchmaking({ userId, sessionId });
    goToHomePage();
  };

  useEffect(() => {
    console.log(`matchStatus changed: ${matchStatus} or countdown changed: ${countdown}`);

    // When countdown reaches 0 and we're still WAITING, set status message to processing.
    if (matchStatus === MatchingStatusEnum.WAITING && countdown === 0) {
      setStatusMessage('Processing');
      return;
    }

    switch (matchStatus) {
      case MatchingStatusEnum.WAITING:
        setStatusMessage(countdown.toString());
        break;
      case MatchingStatusEnum.MATCHED:
        setStatusMessage('Match found! Redirecting...');
        // We can't set async to useEffect directly so define an async function here.
        (async () => {
          const collab = await getCollab({ userId });
          setCollab(collab.collab);
          setTimeout(() => goToCollabPage(), REDIRECT_TIMEOUT);
        })();
        break;
      case MatchingStatusEnum.NO_MATCH:
        setStatusMessage('Match not found. Redirecting to homepage');
        setTimeout(() => goToHomePage(), REDIRECT_TIMEOUT);
        break;
      case MatchingStatusEnum.CANCELLED:
        setStatusMessage('Cancelled. Redirecting to homepage');
        setTimeout(() => goToHomePage(), REDIRECT_TIMEOUT);
        break;
      default:
        setTimeout(() => goToHomePage(), REDIRECT_TIMEOUT);
        break;
    }
  }, [matchStatus, countdown]);

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <div style={{ textAlign: 'center' }}>
        <div>
          <h2>Matching... {matchStatus}</h2>
          <SearchIcon fontSize="large" />
          <div style={{ marginTop: '1rem' }}>{statusMessage}</div>
          <Button variant="outlined" color="error" onClick={handleMatchCancelled} sx={{ mt: 2 }}>
            Cancel Match
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Matching;
