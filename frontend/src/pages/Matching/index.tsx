import { 
  Button, 
  Container, 
  Typography, 
  CircularProgress, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions 
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import NavBar from '../../components/navbar';
import { useAuth } from '../../context/authcontext';
import { getCollab } from '../../hooks/collab/collab';
import { cancelMatchmaking } from '../../hooks/matching/matching';
import pageNavigation from '../../hooks/navigation/pageNavigation';
import { MatchingStatusEnum } from '../../types/matching';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const REDIRECT_TIMEOUT = 3000;

const Matching = () => {
  // State Management
  const { user, sessionId, setCollab } = useAuth();
  const { goToHomePage, goToCollabPage } = pageNavigation();
  const [matchStatus, setMatchStatus] = useState<MatchingStatusEnum>(MatchingStatusEnum.WAITING);
  const [timer, setTimer] = useState<number>(0);
  const [dots, setDots] = useState<string>('.');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const userId = user.id;
  const socketRef = useRef<Socket | null>(null);
  
  // WebSocket Connection
  useEffect(() => {
    const socket = io(BASE_URL, { 
      path: '/matching/websocket',
      transports: ['websocket']
    });
    socketRef.current = socket;

    const handleConnect = () => {
      toast.success(`Connected to server with socket ID: ${socket.id}`);
      console.log('Connected:', socket.id);
    };

    const handleConnectError = (err: Error) => {
      console.error('Connection failed:', err);
      toast.error('Failed to connect to matching service');
    };

    const handleStatusUpdate = (data: { status: MatchingStatusEnum, timer: number }) => {
      setMatchStatus(data.status);
      if (data.status === MatchingStatusEnum.MATCHED) {
        socket.disconnect();
      }
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

    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('matchmaking status', handleStatusUpdate);
    };
  }, []);

  // Timeout Handling
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (matchStatus === MatchingStatusEnum.WAITING) {
      timeout = setTimeout(() => {
        cancelMatchmaking({ 
          userId, 
          sessionId
        });
        setShowTimeoutDialog(true);
      }, Number(process.env.MATCH_TIMEOUT || 30000));
    }

    return () => clearTimeout(timeout);
  }, [matchStatus]);

  // UI Effects
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);

    const timerInterval = setInterval(() => setTimer(prev => prev + 1), 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timerInterval);
    };
  }, []);

  // Status Handler
  useEffect(() => {
    switch (matchStatus) {
      case MatchingStatusEnum.MATCHED:
        (async () => {
          const collab = await getCollab({ userId });
          setCollab(collab.collab);
          setTimeout(goToCollabPage, REDIRECT_TIMEOUT);
        })();
        break;
      case MatchingStatusEnum.NO_MATCH:
      case MatchingStatusEnum.CANCELLED:
        setTimeout(goToHomePage, REDIRECT_TIMEOUT);
        break;
    }
  }, [matchStatus]);

  // Dialog Handlers
  const handleCancelRequest = () => setShowConfirm(true);
  
  const handleConfirmClose = async (confirmed: boolean) => {
    setShowConfirm(false);
    if (confirmed) {
      await cancelMatchmaking({ 
        userId, 
        sessionId
      });
      setMatchStatus(MatchingStatusEnum.CANCELLED);
    }
  };

  // Time Formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  function handleTimeoutConfirm(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    // Close the timeout dialog and navigate the user back to the home page
    setShowTimeoutDialog(false);
    goToHomePage();
  }

  return (
<Container disableGutters component="main" maxWidth={false}>
  <NavBar />
  <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 4,
    filter: showTimeoutDialog ? 'blur(2px)' : 'none', 
    transition: 'filter 0.3s ease'
  }}>

    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h2" component="div" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Typography component="span" style={{ fontSize: '30px' }}>Matching</Typography>
        <Typography component="span" style={{ fontSize: '30px' }} sx={{ width: '2em' }}>
          {dots}
        </Typography>
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Elapsed Time: {formatTime(timer)}
      </Typography>
    </Box>
    <CircularProgress size={80} thickness={4} />
    <Button
      variant="contained"
      color="error"
      size="large"
      onClick={handleCancelRequest}
      sx={{ mt: 4 }}
    >
      Cancel Matching
    </Button>

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
          py: 3
        }
      }}
    >
      <DialogTitle sx={{ fontSize: '1.5rem' }}>
        ⏰ Matching Timeout
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Sorry!! No match found, please try again later.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button 
          onClick={handleTimeoutConfirm}
          variant="contained"
          color="primary"
          sx={{ width: 120 }}
        >
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
          minHeight: 150 
        } 
      }}
    >
    </Dialog>
  </Box>
</Container>

  );
};

export default Matching;
