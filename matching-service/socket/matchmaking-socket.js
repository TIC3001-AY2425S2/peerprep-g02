import { Server } from "socket.io";

// For more info can refer to: https://socket.io/docs/v4/tutorial/introduction
// Look at ES Modules if it ever shows up.


export default function setupMatchmakingSocket(server) {
  const io = new Server(server, {
    // Enable connection recovery.
    // https://socket.io/docs/v4/tutorial/step-6
    // https://socket.io/docs/v4/tutorial/step-9
    connectionStateRecovery: {}
  });

  io.on("connection", (socket) => {
    // Socket.io (WebSocket) is event driven and essentially expects a call from frontend like so:
    // socket.emit('chat message', input.value); then from here we'll handle it by doing
    // socket.on('chat message', (message) => ..... and so on.
    // So to say we can change 'chat message' to be something else for different kinds of response.
    // Kinda like a "controller" or entry point.
    // Another example:
    // Client emits a message world on socket hello: socket.emit('hello', 'world');
    // Server can receive the message listening on socket hello:
    // socket.on('hello', (arg) => console.log(arg)); // prints 'world'

    console.log('a user connected');

    socket.on("matchmaking status", (id, msg) => {
      // Send a message to the socket with the given id
      // We just need each user to have their own id tracked on their own end.

      socket.to(id).emit("matchmaking status", msg);
    });


    socket.on("disconnect", () => {
      console.log('a user disconnected')
    });
  });

  return io;
}
