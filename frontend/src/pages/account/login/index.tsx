import SearchIcon from '@mui/icons-material/Search';
import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import NavBar from '../../../components/navbar';
import pageNavigation from '../../../hooks/navigation/pageNavigation';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const socket = io(BASE_URL, { path: '/matching' });

const Matching = () => {
  const { goToHomePage } = pageNavigation();
  const [matchStatus, setMatchStatus] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server with socket ID:', socket.id);
    });

    // Listen for matchmaking status updates
    socket.on('matchmaking status', (status) => {
      console.log('Received matchmaking status from server:', status);
      setMatchStatus(status);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('matchmaking status');
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (socket.connected) {
        // TODO: replace 123 with userId.
        socket.emit('matchmaking status', socket.id, '123');
      }
    }, 1000);

    // Clear the interval on component unmount to prevent memory leaks.
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (matchStatus === 'TERMINATED') {
      goToHomePage();
    }
  }, [matchStatus]);

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <div style={{ textAlign: 'center' }}>
        <div>
          <h2>Matching...</h2>
          <SearchIcon fontSize="large" />
          <div style={{ marginTop: '1rem' }}>{matchStatus}</div>
        </div>
      </div>
    </Container>
  );
};

export default Matching;
