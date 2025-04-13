import { createClient } from 'redis';
import { connectToDB } from '../model/repository.js';
import QuestionService from '../service/QuestionService.js';

// Usage tutorial: https://github.com/redis/node-redis/tree/master/packages/redis

const client = await createClient({
  url: process.env.REDIS_LOCAL_URL || 'redis://localhost:6379',
});

// Must have this otherwise if an error occurs and nothing is there to catch it, the entire app goes down.
// Maybe we want it to crash if connection to redis is lost?
// client.on('error', (err) => {
//   console.error('Redis Client Error: ', err);
// });

async function initRedis(server, port) {
  try {
    await connectToDB();
    console.log('MongoDB Connected!');

    await client.connect();
    console.log('Connected to Redis');
    await QuestionService.populateDistinctCategoryComplexity();

    server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error connecting to dependencies: ', err);
  }
}

export default {
  client,
  initRedis,
};
