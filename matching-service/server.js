import 'dotenv/config';
import http from 'http';
import index from './index.js';
import redisClient from './repository/redis.js';
import MessageSink, { scheduleConsumerQueueFromRedis } from './service/MessageSink.js';
import setupMatchmakingSocket from './socket/matchmaking-socket.js';

const port = process.env.PORT || 8002;

await MessageSink.startAllConsumers();
const server = http.createServer(index);
setupMatchmakingSocket(server);

// Connect only once on startup and let it stay connected throughout lifespan of application
await redisClient
  .connect()
  .then(() => {
    console.log('Connected to Redis');
    server.listen(port);
    MessageSink.scheduleConsumerQueueFromRedis();
    console.log('Matching service server listening on http://localhost:' + port);
  })
  .catch((err) => {
    console.error('Could not connect to Redis:', err);
  });
