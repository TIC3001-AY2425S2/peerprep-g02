import { createClient } from 'redis';

// Usage tutorial: https://github.com/redis/node-redis/tree/master/packages/redis

const redisClient = await createClient({
  url: process.env.REDIS_LOCAL_URL || 'redis://localhost:6379',
});

// Must have this otherwise if an error occurs and nothing is there to catch it, the entire app goes down.
// Maybe we want it to crash if connection to redis is lost?
// redisClient.on('error', (err) => {
//   console.error('Redis Client Error: ', err);
// });

export default redisClient;
