import Redis from './redis.js';

const COLLAB_SESSION_KEY = 'collab';

async function getCollabYdoc(collabId) {
  return await Redis.client.get(`${COLLAB_SESSION_KEY}:${collabId}`);
}

async function setCollabYdoc(collabId, ydoc) {
  await Redis.client.set(`${COLLAB_SESSION_KEY}:${collabId}`, ydoc);
}

export default { getCollabYdoc, setCollabYdoc };
