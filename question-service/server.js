import 'dotenv/config';
import http from 'http';
import index from './index.js';
import Redis from './repository/redis.js';

const port = process.env.PORT || 8001;

const server = http.createServer(index);

await Redis.initRedis(server, port);
