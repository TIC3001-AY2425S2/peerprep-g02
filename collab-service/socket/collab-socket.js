import { Server } from 'socket.io';
import * as Y from 'yjs';
import CollabRepository from '../model/collab-repository.js';
import RedisRepository from '../repository/redis-repository.js';

// For more info can refer to: https://socket.io/docs/v4/tutorial/introduction
// Look at ES Modules if it ever shows up.

// This is by far the most confusing thing in this entire project or rather my lack of understanding
// of yjs and trying to use a library here wasted a lot of time.
// The best way to do this is to just implement your own. I did not expect y-websocket to be so inflexible
// but that may be that our use case is not fit for it or I do not understand y-websocket well enough.
// Here we just retrieve all updates and emit back to the entire room based on collabId retrieved from mongodb.
export default function setupCollabSocket(server) {
  const io = new Server(server, {
    // Enable connection recovery.
    // https://socket.io/docs/v4/tutorial/step-6
    // https://socket.io/docs/v4/tutorial/step-9
    connectionStateRecovery: {},
    path: '/collab/websocket',
  });

  io.on('connection', async (socket) => {
    // Here we use redis to store a ydoc which contains all the code stuff.
    // When user disconnects then we save the ydoc into Collab model.
    // This has the advantage of fast read/writes using redis and prevents
    // overloading the database with write calls.

    console.log('CollabSocket: A user connected');
    const room = socket.handshake.query.room;
    socket.join(room);

    const ydoc = new Y.Doc();

    // Try to load an existing ydoc from Redis
    const encodedYdoc = await RedisRepository.getCollabYdoc(room);
    if (encodedYdoc) {
      const encodedYdocBuffer = Buffer.from(encodedYdoc, 'base64');
      Y.applyUpdate(ydoc, new Uint8Array(encodedYdocBuffer));
    } else {
      // If no state exists, save initial empty ydoc to Redis
      const initialYdoc = Y.encodeStateAsUpdate(ydoc);
      const encodedInitialYdoc = Buffer.from(initialYdoc).toString('base64');
      await RedisRepository.setCollabYdoc(room, encodedInitialYdoc);
    }

    // Send the initial ydoc to the connected client
    socket.emit('yjs update', Y.encodeStateAsUpdate(ydoc));

    // Listen for updates from this client
    socket.on('yjs update', async (update) => {
      // Apply the incoming update to the Y.Doc
      Y.applyUpdate(ydoc, update);
      // Broadcast the update to other clients in the room
      socket.to(room).emit('yjs update', update);
      // Persist the updated Y.Doc state to Redis
      const newYdocUpdate = Y.encodeStateAsUpdate(ydoc);
      const encodedNewYdocUpdate = Buffer.from(newYdocUpdate).toString('base64');
      await RedisRepository.setCollabYdoc(room, encodedNewYdocUpdate);
    });

    socket.onAny((event, ...args) => {
      console.log(`Received event: "${event}" with data:`, args);
    });

    socket.on('awareness', (encodedUpdate) => {
      // Broadcast the awareness update to all other clients in the room
      socket.to(room).emit('awareness', encodedUpdate);
    });

    // Send chat history on 1st connect.
    const chatHistory = await RedisRepository.getCollabChat(room);
    socket.emit('chat history', chatHistory);

    socket.on('chat message', async (message) => {
      await RedisRepository.setCollabChat(room, message);
      socket.to(room).emit('chat message', message);
    });

    socket.on('disconnect', async () => {
      // Retrieve the ydoc stored in redis.
      console.log('CollabSocket: A user disconnected');
      const ydoc = await RedisRepository.getCollabYdoc(room);
      // Store the retrieved ydoc in collab repository.
      await CollabRepository.updateCollab(room, ydoc);
      console.log(`Saved ydoc to Collab model for ${room}`);
    });
  });

  return io;
}
