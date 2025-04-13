import 'dotenv/config';
import http from 'http';
import index from './index.js';
import Redis from './repository/redis.js';
import setupCollabSocket from './socket/collab-socket.js';

const port = process.env.PORT || 8003;

const server = http.createServer(index);

// Start websocket
setupCollabSocket(server);

await Redis.initRedis(server, port);
