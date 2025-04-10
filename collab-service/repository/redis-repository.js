import Redis from './redis.js';

const COLLAB_YDOC_SESSION_KEY = 'collab:ydoc';
const COLLAB_CHAT_SESSION_KEY = 'collab:chat';

async function getCollabYdoc(collabId) {
  return await Redis.client.get(`${COLLAB_YDOC_SESSION_KEY}:${collabId}`);
}

async function setCollabYdoc(collabId, ydoc) {
  await Redis.client.set(`${COLLAB_YDOC_SESSION_KEY}:${collabId}`, ydoc);
}

async function getCollabChat(collabId) {
  const messages = await Redis.client.lRange(`${COLLAB_CHAT_SESSION_KEY}:${collabId}`, 0, -1);
  return messages.map((msg) => JSON.parse(msg));
}

async function addCollabChat(collabId, message) {
  await Redis.client.rPush(`${COLLAB_CHAT_SESSION_KEY}:${collabId}`, JSON.stringify(message));
}

export default { getCollabYdoc, setCollabYdoc, getCollabChat, addCollabChat };
