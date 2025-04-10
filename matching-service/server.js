import 'dotenv/config';
import http from 'http';
import index from './index.js';
import Redis from './repository/redis.js';
import setupMatchmakingSocket from './socket/matchmaking-socket.js';

const port = process.env.PORT || 8002;

const server = http.createServer(index);

// Start websocket
setupMatchmakingSocket(server);

// Initialize Redis and start the server.
await Redis.initRedis(server, port);
