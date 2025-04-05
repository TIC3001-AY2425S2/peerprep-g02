import 'dotenv/config';
import { createClient } from 'redis';
import MessageSink from '../service/MessageSink.js';

// Usage tutorial: https://github.com/redis/node-redis/tree/master/packages/redis

let subscriberInstance = null;

const client = await createClient({
  url: process.env.REDIS_LOCAL_URL || 'redis://localhost:6379',
});

async function initRedis(server, port) {
  try {
    await client.connect();
    console.log('Connected to Redis');
    await client.configSet('notify-keyspace-events', 'Ex');
    subscriberInstance = await client.duplicate();
    await subscriberInstance.connect();
    await MessageSink.startAllConsumers();
    server.listen(port);
    console.log('Matching service server listening on http://localhost:' + port);
  } catch (err) {
    console.error('Could not connect to Redis:', err);
  }
}

export default {
  client,
  get subscriber() {
    return subscriberInstance;
  },
  initRedis,
};
