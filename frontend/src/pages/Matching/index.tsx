import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
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
  const { user, sessionId, setCollab, removeSessionId } = useAuth();
  const { goToHomePage, goToCollabPage } = pageNavigation();
  const [matchStatus, setMatchStatus] = useState<MatchingStatusEnum>(MatchingStatusEnum.WAITING);
  const [countdown, setCountdown] = useState<number | ''>('');
  const [dots, setDots] = useState<string>('.');
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const userId = user.id;

  useEffect(() => {
    const socket = io(BASE_URL, {
      path: '/matching/websocket',
    });

    const handleConnect = () => {
      toast.success(`Connected to server with socket ID: ${socket.id}`);
      console.log('Connected:', socket.id);
    };

    const handleConnectError = (err: Error) => {
      console.error('Connection failed:', err);
      toast.error('Failed to connect to matching service');
    };

    const handleStatusUpdate = (data: { status: MatchingStatusEnum; timer: number }) => {
      if (data.status === MatchingStatusEnum.MATCHED) {
        socket.disconnect();
      }
      setMatchStatus(data.status);
      setCountdown(data.timer);
      setStatusLoaded(true);
    };

    socket
      .on('connect', handleConnect)
      .on('connect_error', handleConnectError)
      .on('matchmaking status', handleStatusUpdate);

    const pollInterval = setInterval(() => {
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
      clearInterval(pollInterval);
      handleBeforeUnload();
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('matchmaking status', handleStatusUpdate);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Processing...';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeoutConfirm = () => {
    setShowTimeoutDialog(false);
    removeSessionId();
    goToHomePage();
  };

  const handleCancelRequest = () => setShowConfirm(true);

  const handleConfirmClose = async (confirmed: boolean) => {
    setShowConfirm(false);
    if (confirmed) {
      await cancelMatchmaking({ userId, sessionId });
      removeSessionId();
      goToHomePage();
    }
  };

  useEffect(() => {
    console.log(`matchStatus changed: ${matchStatus} or countdown changed: ${countdown}`);

    // When countdown reaches 0, set status message to processing.
    if (statusLoaded && matchStatus === MatchingStatusEnum.WAITING && countdown <= 0) {
      return;
    }

    switch (matchStatus) {
      case MatchingStatusEnum.WAITING:
        break;
      case MatchingStatusEnum.PROCESSING:
        break;
      case MatchingStatusEnum.MATCHED:
        // We can't set async to useEffect directly so define an async function here.
        (async () => {
          const collab = await getCollab({ userId });
          setCollab(collab.collab);
          removeSessionId();
          setTimeout(() => goToCollabPage(), REDIRECT_TIMEOUT);
        })();
        break;
      case MatchingStatusEnum.NO_MATCH:
        setShowTimeoutDialog(true);
        break;
      case MatchingStatusEnum.CANCELLED:
        break;
      default:
        removeSessionId();
        setTimeout(() => goToHomePage(), REDIRECT_TIMEOUT);
        break;
    }
  }, [matchStatus, countdown]);

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 4,
          filter: showTimeoutDialog ? 'blur(2px)' : 'none',
          transition: 'filter 0.3s ease',
        }}
      >
        {/* Combined status display */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" component="div" sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography component="span" style={{ fontSize: '30px' }}>
              {matchStatus === MatchingStatusEnum.MATCHED ? 'Match Found!' : 'Matching'}
            </Typography>
            <Typography component="span" style={{ fontSize: '30px' }} sx={{ width: '2em' }}>
              {matchStatus === MatchingStatusEnum.WAITING ? dots : ''}
            </Typography>
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {typeof countdown === 'number' ? `Estimated time: ${formatTime(countdown)}` : 'Processing...'}
          </Typography>
        </Box>

        <CircularProgress size={80} thickness={4} />

        {/* Combined cancel button functionality */}
        <Button
          variant="contained"
          color="error"
          size="large"
          disabled={!sessionId || matchStatus !== MatchingStatusEnum.WAITING}
          onClick={handleCancelRequest}
          sx={{ mt: 4 }}
        >
          Cancel Matching
        </Button>

        {/* Preserve dialog designs from previous version */}
        <Dialog
          open={showTimeoutDialog}
          onClose={handleTimeoutConfirm}
          BackdropProps={{ style: { backgroundColor: 'rgba(0,0,0,0.4)' } }}
          sx={{
            '& .MuiPaper-root': {
              width: '30vw',
              minWidth: 300,
              maxWidth: 400,
              textAlign: 'center',
              py: 3,
            },
          }}
        >
          <DialogTitle sx={{ fontSize: '1.5rem' }}>⏰ Matching Timeout</DialogTitle>
          <DialogContent>
            <Typography variant="body1">Sorry!! No match found, please try again later.</Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button onClick={handleTimeoutConfirm} variant="contained" color="primary" sx={{ width: 120 }}>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showConfirm}
          onClose={() => handleConfirmClose(false)}
          sx={{
            '& .MuiPaper-root': {
              width: '20vw',
              height: '25vh',
              minWidth: 300,
              minHeight: 150,
            },
          }}
        >
          <DialogTitle>Confirm Cancellation</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to cancel matching?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleConfirmClose(false)}>No</Button>
            <Button onClick={() => handleConfirmClose(true)} color="error">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Matching;
