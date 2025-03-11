import 'dotenv/config';
import http from 'http';
import index from './index.js';
import MessageSink from './service/MessageSink.js';

const port = process.env.PORT || 8002;

await MessageSink.startAllConsumers();
const server = http.createServer(index);
server.listen(port);
console.log('Matching service server listening on http://localhost:' + port);
