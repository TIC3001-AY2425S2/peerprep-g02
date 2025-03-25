import SearchIcon from '@mui/icons-material/Search';
import { Button, Container } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import NavBar from '../../components/navbar';
import pageNavigation from '../../hooks/navigation/pageNavigation';
import { MatchingStatusEnum } from '../../types/matching';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const MATCHING_CANCEL_URL = BASE_URL + '/matching/cancel';
const TIMEOUT = process.env.MATCH_TIMEOUT as unknown as number || 30;
const REDIRECT_TIMEOUT = 3000; // 3 seconds countdown to redirect to homepage.

const Matching = () => {
  const { goToHomePage } = pageNavigation();
  const [matchStatus, setMatchStatus] = useState<MatchingStatusEnum | ''>('');
  const [countdown, setCountdown] = useState<number>(TIMEOUT);
  const [statusMessage, setStatusMessage] = useState<string>(countdown.toString());
  const matchStatusRef = useRef(matchStatus);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(BASE_URL, { path: '/matching/websocket' });
    socketRef.current = socket;
    if (!socket.connected) {
      console.log("Running connect");
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('Connected to server with socket ID:', socket.id);
    });

    socket.on('matchmaking status', (status) => {
      console.log('Received matchmaking status from server:', status);
      setMatchStatus(status);
    });

    // Set up an interval to emit status requests every second.
    const intervalId = setInterval(() => {
      if (socket.connected) {
        // TODO: replace 123 with userId.
        socket.emit('matchmaking status', socket.id, '123');
      }
    }, 1000);

    // When User refreshes or closes/navigates away from the page we disconnect the socket.
    // Since there are some browser restrictions on using a socket during this short window of time,
    // we'll use navigator.sendBeacon to cancel the match instead.
    const handleBeforeUnload = () => {
      console.log("Running handleBeforeUnlock");
      socket.disconnect();

      console.log("match status: ", matchStatusRef.current);
      if (matchStatusRef.current === MatchingStatusEnum.WAITING) {
        console.log("Sending beacon to cancel match");
        // TODO: Replace '123' with the actual userId
        navigator.sendBeacon(MATCHING_CANCEL_URL + `/123`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup both the socket listeners and the interval on unmount.
    return () => {
      console.log("Running off connect and status");
      clearInterval(intervalId);
      handleBeforeUnload();
      socket.off('connect');
      socket.off('matchmaking status');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleMatchCancelled = () => goToHomePage();

  const handleMatchNotFound = () => {
    setStatusMessage("Match not found. Redirecting to homepage");
    const timer = setTimeout(() => goToHomePage(), REDIRECT_TIMEOUT);
    return () => clearTimeout(timer);
  };

  const handleWaitingForMatch = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          const newCount = prev - 1;
          setStatusMessage(newCount.toString());
          return newCount;
        } else {
          setStatusMessage("Processing");
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  };


  useEffect(() => {
    let cleanup = () => {};
    matchStatusRef.current = matchStatus;
    console.log("Triggering cleanup");
    switch (matchStatus) {
      case MatchingStatusEnum.CANCELLED:
        handleMatchCancelled();
        break;
      case MatchingStatusEnum.NO_MATCH:
        cleanup = handleMatchNotFound();
        break;
      case MatchingStatusEnum.WAITING:
        cleanup = handleWaitingForMatch();
        break;
      case MatchingStatusEnum.MATCHED:
        // TODO: Add collaboration service redirect here
      default:
        break;
    }
    return cleanup;
  }, [matchStatus]);

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
