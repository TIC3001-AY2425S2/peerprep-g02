import { Server } from 'socket.io';

// For more info can refer to: https://socket.io/docs/v4/tutorial/introduction
// Look at ES Modules if it ever shows up.

export default function setupCollabSocket(server) {
  const io = new Server(server, {
    // Enable connection recovery.
    // https://socket.io/docs/v4/tutorial/step-6
    // https://socket.io/docs/v4/tutorial/step-9
    connectionStateRecovery: {},
    path: '/collab/websocket',
  });

  io.on('connection', (socket) => {
    // Socket.io (WebSocket) is event driven and essentially expects a call from frontend like so:
    // socket.emit('chat message', input.value); then from here we'll handle it by doing
    // socket.on('chat message', (message) => ..... and so on.
    // So to say we can change 'chat message' to be something else for different kinds of response.
    // Kinda like a "controller" or entry point.
    // Another example:
    // Client emits a message world on socket hello: socket.emit('hello', 'world');
    // Server can receive the message listening on socket hello:
    // socket.on('hello', (arg) => console.log(arg)); // prints 'world'

    console.log('CollabSocket: A user connected');

    socket.on('collab update', async (socketId, user) => {
      // console.log(`Received message from ${socketId}, content: ${JSON.stringify(user)}`);

      // console.log(`Emitting match status: ${status} and timer ${timer}`);
      socket.emit('collab update', { status, timer });
    });

    socket.on('disconnect', async () => {
      console.log('CollabSocket: A user disconnected');
    });
  });

  return io;
}
