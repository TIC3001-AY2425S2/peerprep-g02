import 'dotenv/config';
import http from 'http';
import index from './index.js';
import { connectToDB } from './model/repository.js';
import redisClient from './repository/redis.js';
import QuestionService from './service/QuestionService.js';

const port = process.env.PORT || 8001;

const server = http.createServer(index);

async function startServer() {
  try {
    await connectToDB();
    console.log('MongoDB Connected!');

    await redisClient.connect();
    console.log('Connected to Redis');
    await QuestionService.populateDistinctCategoryComplexity();

    server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error connecting to dependencies: ', err);
  }
}

await startServer();
