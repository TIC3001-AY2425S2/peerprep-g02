import { ChatContainer, MainContainer, Message, MessageInput, MessageList } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { Compartment, EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { Box, Container, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { basicSetup, EditorView } from 'codemirror';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
import { applyAwarenessUpdate, Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
import * as Y from 'yjs';
import NavBar from '../../components/navbar';
import { useAuth } from '../../context/authcontext';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

// This entire codemirror thing doesn't have good examples as the documentation
// assumes the reader already knows many things. Trying to implement codemirror
// with collab at the same time requires reading a lot of different material,
// testing and trial and error.
function getLanguageExtension(lang) {
  switch (lang) {
    case 'JavaScript':
      return javascript();
    case 'Java':
      return java();
    case 'Python':
      return python();
    case 'C++':
      return cpp();
    default:
      return javascript();
  }
}

const Collab = () => {
  const { collab, user } = useAuth();
  const socketRef = useRef(null);

  const [ydoc] = useState(() => new Y.Doc());
  const editorRef = useRef(null);
  const [editorView, setEditorView] = useState(null);
  const awareness = new Awareness(ydoc);
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const languageCompartment = new Compartment();
  const languages = ['JavaScript', 'Java', 'Python', 'C++'];

  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    socketRef.current = io(BASE_URL, { path: '/collab/websocket', query: { room: collab._id } });
    const socket = socketRef.current;
    if (!socket.connected) {
      console.log('Running connect');
      socket.connect();
    }

    socket.on('connect', () => {
      toast.success(`Connected to server with socket ID: ${socket.id}`);
    });

    // Start of YJS related socket messages
    socket.on('yjs update', (update) => {
      // Ensure update is a Uint8Array cause socket doesn't send as the type ydoc needs.
      const binaryUpdate = update instanceof Uint8Array ? update : new Uint8Array(update);
      Y.applyUpdate(ydoc, binaryUpdate);
    });

    // Listen for local updates on the Y.Doc.
    ydoc.on('update', (update) => {
      socket.emit('yjs update', update);
    });

    const userColors = [
      { color: '#30bced', light: '#30bced33' },
      { color: '#6eeb83', light: '#6eeb8333' },
      { color: '#ffbc42', light: '#ffbc4233' },
      { color: '#ecd444', light: '#ecd44433' },
      { color: '#ee6352', light: '#ee635233' },
      { color: '#9ac2c9', light: '#9ac2c933' },
      { color: '#8acb88', light: '#8acb8833' },
      { color: '#1be7ff', light: '#1be7ff33' },
    ];
    const randomColor = userColors[Math.floor(Math.random() * userColors.length)];
    awareness.setLocalStateField('user', {
      name: user.username,
      color: randomColor.color,
      colorLight: randomColor.light,
    });

    // Listen for local updates for awareness.
    // This just tell you where other users are typing at similar to google docs.
    awareness.on('update', ({ added, updated, removed }) => {
      const changedClients = added.concat(updated).concat(removed);
      const encodedUpdate = encodeAwarenessUpdate(awareness, changedClients);
      socket.emit('awareness', encodedUpdate);
    });

    socket.on('awareness', (encodedUpdate) => {
      const binaryUpdate = encodedUpdate instanceof Uint8Array ? encodedUpdate : new Uint8Array(encodedUpdate);
      applyAwarenessUpdate(awareness, binaryUpdate, null);
    });

    const ytext = ydoc.getText('codemirror');

    ytext.observe((event) => {
      // This is just to prove that we are only receiving delta updates.
      // console.log('Delta from update:', event.delta);
    });

    const undoManager = new Y.UndoManager(ytext);
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        keymap.of([...yUndoManagerKeymap, ...defaultKeymap, indentWithTab]),
        yCollab(ytext, awareness, { undoManager }),
        languageCompartment.of(getLanguageExtension(selectedLanguage)),
      ],
    });
    const view = new EditorView({
      state: state,
      parent: editorRef.current,
    });
    setEditorView(view);

    // Start of chat messages socket messages
    socket.on('chat history', (messages) => {
      // On first load we retrieve chat history
      setChatMessages(messages);
    });

    socket.on('chat message', (newMessage) => {
      // Append new messages to chat message array
      console.log(newMessage);
      setChatMessages((prev) => [...prev, newMessage]);
    });

    // When User refreshes or closes/navigates away from the page we disconnect the socket.
    const handleBeforeUnload = () => {
      console.log('Running handleBeforeUnlock');
      socket.disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup both the socket listeners and the interval on unmount.
    return () => {
      console.log('Running off connect and status');
      handleBeforeUnload();
      view.destroy();
      socket.off('connect');
      socket.off('yjs update');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // https://codemirror.net/examples/config/#dynamic-configuration
  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: languageCompartment.reconfigure(getLanguageExtension(selectedLanguage)),
      });
    }
  }, [selectedLanguage, editorView]);

  const handleSendMessage = (messageText) => {
    const socket = socketRef.current;
    const message = {
      id: Date.now(),
      sender: user.username,
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, message]);
    socket.emit('chat message', message);
  };

  return (
    <Container disableGutters component="main" maxWidth={false}>
      <NavBar />
      <Grid container spacing={2} style={{ width: '100%', height: '100vh' }}>
        <Grid item xs={8} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Language selector dropdown */}
          <Box sx={{ margin: '8px' }}>
            <FormControl fullWidth>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={selectedLanguage}
                label="Language"
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Editor container */}
          <Box
            ref={editorRef}
            sx={{
              border: '1px solid #ccc',
              flex: 1,
              minHeight: '300px',
              textAlign: 'left',
              overflow: 'auto',
            }}
          />
          {/* Question details */}
          <Box sx={{ border: '1px solid #ccc', mt: 2, height: '150px' }}>Question details.</Box>
        </Grid>

        <Grid item xs={4}>
          <Box sx={{ border: '1px solid #ccc', height: '100%', display: 'flex' }}>
            <ChatContainerWrapper sender={user.username} messages={chatMessages} onSend={handleSendMessage} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

const ChatContainerWrapper = ({ sender, messages, onSend }) => {
  return (
    <MainContainer style={{ width: '100%', height: '100%' }}>
      <ChatContainer>
        <MessageList>
          {messages.map((msg) => (
            <Message
              key={msg.id}
              model={{
                // Position single sets all messages to be standalone since we are not going to deal with message grouping from same user.
                position: 'single',
                message: msg.text,
                direction: msg.sender === sender ? 'outgoing' : 'incoming',
                sender: msg.sender,
                sentTime: msg.timestamp,
                type: 'text',
              }}
            >
              <Message.Footer sender={msg.sender} sentTime={format(new Date(msg.timestamp), 'dd/MM/yyyy HH:mm')} />
            </Message>
          ))}
        </MessageList>
        <MessageInput attachButton={false} placeholder="Type your message..." onSend={onSend} />
      </ChatContainer>
    </MainContainer>
  );
};

export default Collab;
