import 'dotenv/config';
import { createClient } from 'redis';
import MessageSink from '../service/MessageSink.js';
import CollabRepository from './collab-repository.js';

// Usage tutorial: https://github.com/redis/node-redis/tree/master/packages/redis

const client = await createClient({
  url: process.env.REDIS_LOCAL_URL || 'redis://localhost:6379',
});

async function initRedis(server, port) {
  try {
    await CollabRepository.connectToDB();
    console.log('MongoDB Connected!');
    await client.connect();
    console.log('Connected to Redis');
    await MessageSink.startAllConsumers();
    server.listen(port);
    console.log('Collab service server listening on http://localhost:' + port);
  } catch (err) {
    console.error('Could not connect to Redis:', err);
  }
}

export default {
  client,
  initRedis,
};
