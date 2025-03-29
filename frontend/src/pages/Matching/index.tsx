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
import NavBar from '../../components/navbar';
import pageNavigation from '../../hooks/navigation/pageNavigation';
import { MatchingStatusEnum } from '../../types/matching';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const MATCHING_CANCEL_URL = `${BASE_URL}/matching/cancel`;
const TIMEOUT = (process.env.MATCH_TIMEOUT as unknown as number) || 30;

const Matching = () => {
  // State Management Section
  const { goToHomePage } = pageNavigation();
  const [matchStatus, setMatchStatus] = useState<MatchingStatusEnum | ''>('');
  const [timer, setTimer] = useState<number>(0);
  const [dots, setDots] = useState<string>('.');
  const [showConfirm, setShowConfirm] = useState(false);
  const matchStatusRef = useRef(matchStatus);
  const socketRef = useRef<Socket | null>(null);

  // WebSocket Connection Section
  useEffect(() => {
    const socket = io(BASE_URL, { path: '/matching/websocket' });
    socketRef.current = socket;
    
    const handleConnect = () => console.log('Connected:', socket.id);
    const handleStatusUpdate = (status: MatchingStatusEnum) => setMatchStatus(status);
    
    socket
      .on('connect', handleConnect)
      .on('matchmaking status', handleStatusUpdate);

    const pollInterval = setInterval(() => {
      if (socket.connected) socket.emit('matchmaking status', socket.id, '123');
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
      socket.off('connect', handleConnect);
      socket.off('matchmaking status', handleStatusUpdate);
    };
  }, []);

  // Animation Effects Section
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);
    return () => clearInterval(dotsInterval);
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Confirmation Dialog Section
  const handleCancelRequest = () => setShowConfirm(true);
  const handleConfirmClose = (confirmed: boolean) => {
    setShowConfirm(false);
    if (confirmed) {
      navigator.sendBeacon(`${MATCHING_CANCEL_URL}/123`);
      goToHomePage();
    }
  };

  // Time Formatting Helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container disableGutters component="main" maxWidth={false}>
      {/* Navigation Bar Component */}
      <NavBar />

      {/* Main Content Container */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 4,
      }}>
        {/* Matching Status Display */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" component="div" sx={{ display: 'flex', justifyContent: 'center' }}>
            {/* Static "Matching" text */}
            <Typography component="span" style={{ fontSize: '30px' }}>Matching</Typography>
            {/* Animated dots */}
            <Typography component="span" style={{ fontSize: '30px' }} sx={{ width: '2em' }}>
              {dots}
            </Typography>
          </Typography>
          
          {/* Elapsed Timer Display */}
          <Typography variant="h6" color="text.secondary">
            Elapsed Time: {formatTime(timer)}
          </Typography>
        </Box>

        {/* Progress Indicator */}
        <CircularProgress size={80} thickness={4} />

        {/* Cancel Button */}
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={handleCancelRequest}
          sx={{ mt: 4 }}
        >
          Cancel Matching
        </Button>

        {/* Confirmation Dialog */}
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
          {/* Dialog Title */}
          <DialogTitle>Confirm Cancel?</DialogTitle>
          
          {/* Dialog Content */}
          <DialogContent dividers>
            Are you sure you want to cancel the matching process?
          </DialogContent>
          
          {/* Dialog Actions */}
          <DialogActions>
            <Button onClick={() => handleConfirmClose(false)}>No</Button>
            <Button 
              onClick={() => handleConfirmClose(true)} 
              color="error"
              variant="contained"
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Matching;
