import 'dotenv/config';
import http from 'http';
import index from './index.js';
import { connectToDB } from './model/repository.js';

const port = process.env.PORT || 8001;

const server = http.createServer(index);
server.listen(port);
console.log('Matching service server listening on http://localhost:' + port);
