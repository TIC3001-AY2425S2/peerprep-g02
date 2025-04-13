import { Server } from 'socket.io';
import * as Y from 'yjs';
import CollabRepository from '../repository/collab-repository.js';
import RedisRepository from '../repository/redis-repository.js';

// Taken from this genius: https://discuss.yjs.dev/t/how-to-recover-to-the-specified-version/2301/4
function revertChangesSinceSnapshot(doc, snapshotEncoded) {
  const snap = Y.decodeSnapshot(snapshotEncoded);
  const tempdoc = Y.createDocFromSnapshot(doc, snap);

  const currentStateVector = Y.encodeStateVector(doc);
  const snapshotStateVector = Y.encodeStateVector(tempdoc);

  const changesSinceSnapshotUpdate = Y.encodeStateAsUpdate(doc, snapshotStateVector);
  // const um = new Y.UndoManager([...tempdoc.share.values()]);
  const textType = tempdoc.getText('codemirror');
  const um = new Y.UndoManager(textType);
  // console.log('1 before revert in revert function tempdoc: ', tempdoc.getText('codemirror').toString());
  tempdoc.transact(() => {
    Y.applyUpdate(tempdoc, changesSinceSnapshotUpdate);
  });
  // console.log('2 after revert in revert function tempdoc: ', tempdoc.getText('codemirror').toString());
  um.undo();
  // console.log('3 after revert in revert function tempdoc: ', tempdoc.getText('codemirror').toString());

  const revertChangesSinceSnapshotUpdate = Y.encodeStateAsUpdate(tempdoc, currentStateVector);
  // console.log('4 before revert in revert function tempdoc: ', doc.getText('codemirror').toString());
  Y.applyUpdate(doc, revertChangesSinceSnapshotUpdate);
  // console.log('5 after revert in revert function tempdoc: ', doc.getText('codemirror').toString());
}

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
    ydoc.gc = false;

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

    // Send list of versions if any, to clients.
    const versions = await CollabRepository.getCollabHistoryVersions(room);
    socket.emit('history snapshots', versions);

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

      const changeCount = await RedisRepository.incrementCollabChangeCount(room);
      // Every 50 updates, save a history snapshot.
      if (changeCount % 50 === 0) {
        const snapshot = Y.snapshot(ydoc);
        const encodedSnapshot = Y.encodeSnapshot(snapshot);
        const encodedSnapshotString = Buffer.from(encodedSnapshot).toString('base64');
        await CollabRepository.createCollabHistory(room, encodedSnapshotString);
        // Send the new versions to everyone including the one who triggered the update.
        const versions = await CollabRepository.getCollabHistoryVersions(room);
        io.in(room).emit('history snapshots', versions);
      }
    });

    socket.on('yjs load snapshot', async (version) => {
      const historyEntry = await CollabRepository.getCollabHistory(room, version);
      if (historyEntry) {
        const snapshotBuffer = Buffer.from(historyEntry.snapshot, 'base64');
        const snapshotUpdate = new Uint8Array(snapshotBuffer);
        revertChangesSinceSnapshot(ydoc, snapshotUpdate);
        const updatedState = Y.encodeStateAsUpdate(ydoc);
        const encodedUpdatedState = Buffer.from(updatedState).toString('base64');
        await RedisRepository.setCollabYdoc(room, encodedUpdatedState);

        io.in(room).emit('yjs load snapshot', updatedState);
        console.log(`Loaded snapshot version ${version} for room ${room} and broadcasted to all clients.`);
      } else {
        console.log(`No snapshot found for room ${room} with version ${version}.`);
      }
    });

    // socket.onAny((event, ...args) => {
    //   console.log(`Received event: "${event}" with data:`, args);
    // });

    socket.on('awareness', (encodedUpdate) => {
      // Broadcast the awareness update to all other clients in the room
      socket.to(room).emit('awareness', encodedUpdate);
    });

    // Send chat history on 1st connect.
    const chatHistory = await RedisRepository.getCollabChat(room);
    socket.emit('chat history', chatHistory);

    socket.on('chat message', async (message) => {
      await RedisRepository.addCollabChat(room, message);
      socket.to(room).emit('chat message', message);
    });

    // Leave session
    socket.on('leave collab', async (userId, callback) => {
      try {
        const collab = await CollabRepository.setInactiveCollabUser(userId);
        callback(true);
      } catch (error) {
        console.log('CollabService: Error occurred while creating collab', error);
        callback(false);
      }
    });

    socket.on('disconnect', async () => {
      // Retrieve the ydoc stored in redis.
      console.log('CollabSocket: A user disconnected');
      const ydocString = await RedisRepository.getCollabYdoc(room);
      const snapshot = Y.snapshot(ydoc);
      const encodedSnapshot = Y.encodeSnapshot(snapshot);
      const encodedSnapshotString = Buffer.from(encodedSnapshot).toString('base64');
      await CollabRepository.createCollabHistory(room, encodedSnapshotString);
      // Store the retrieved ydoc in collab repository.
      await CollabRepository.updateCollab(room, ydocString);
      console.log(`Saved ydoc to Collab model for ${room}`);
    });
  });

  return io;
}
