import SearchIcon from '@mui/icons-material/Search';
import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import * as Y from 'yjs';
import NavBar from '../../components/navbar';
import { useAuth } from '../../context/authcontext';
import pageNavigation from '../../hooks/navigation/pageNavigation';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const Collab = () => {
  const { collab, user } = useAuth();
  const { goToHomePage } = pageNavigation();
  const [docStateStr, setDocStateStr] = useState('');
  const [ydoc] = useState(() => new Y.Doc());
  const userId = user.id;
  console.log(collab._id);

  useEffect(() => {
    const socket = io(BASE_URL, { path: '/collab/websocket', query: { room: collab._id } });
    if (!socket.connected) {
      console.log('Running connect');
      socket.connect();
    }

    socket.on('connect', () => {
      toast.success(`Connected to server with socket ID: ${socket.id}`);
    });

    socket.on('yjs update', (update) => {
      console.log('Received update:', update);
      // Ensure update is a Uint8Array cause socket doesn't send as the type ydoc needs.
      const binaryUpdate = update instanceof Uint8Array ? update : new Uint8Array(update);
      Y.applyUpdate(ydoc, binaryUpdate);
    });

    // Listen for local updates on the Y.Doc.
    ydoc.on('update', (update) => {
      socket.emit('yjs update', update);
      console.log(ydoc);
      setDocStateStr(ydoc.getText('sharedText').toString());
    });

    // When User refreshes or closes/navigates away from the page we disconnect the socket.
    const handleBeforeUnload = () => {
      console.log('Running handleBeforeUnlock');
      socket.disconnect();
    };

    const sharedText = ydoc.getText('sharedText');
    const intervalId = setInterval(() => {
      // Append the letter "A" at the end of the shared text.
      sharedText.insert(sharedText.length, 'A');
    }, 1000);

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup both the socket listeners and the interval on unmount.
    return () => {
      console.log('Running off connect and status');
      clearInterval(intervalId);
      handleBeforeUnload();
      socket.off('connect');
      socket.off('yjs update');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <div style={{ textAlign: 'center' }}>
        <div>
          {docStateStr}
          <SearchIcon fontSize="large" />
        </div>
      </div>
    </Container>
  );
};

export default Collab;
