import 'dotenv/config';
import http from 'http';
import index from './index.js';
import { connectToDB } from './model/collab-repository.js';
import MessageSink from './service/MessageSink.js';
import setupCollabSocket from './socket/collab-socket.js';

const port = process.env.PORT || 8003;

const server = http.createServer(index);

// Start websocket
setupCollabSocket(server);

async function startServer() {
  try {
    await connectToDB();
    console.log('MongoDB Connected!');

    await MessageSink.startAllConsumers();

    server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error connecting to dependencies: ', err);
  }
}

await startServer();
