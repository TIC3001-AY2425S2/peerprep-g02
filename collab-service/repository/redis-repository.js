import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import Redis from './redis.js';

const COLLAB_YDOC_SESSION_KEY = 'collab:ydoc';
const COLLAB_CHAT_SESSION_KEY = 'collab:chat';
const MATCH_STATUS_KEY = 'match:status';

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

export async function setMatchStatusIfStatusWaiting(userId, sessionId, status) {
  const script = `
    local current = redis.call('GET', KEYS[1])
    if current == ARGV[1] then
      return redis.call('SET', KEYS[1], ARGV[2])
    else
      return nil
    end
  `;

  return await Redis.client.eval(script, {
    keys: [`${MATCH_STATUS_KEY}:${userId}:${sessionId}`],
    arguments: [MatchingStatusEnum.PROCESSING, status],
  });
}

async function incrementCollabChangeCount(room) {
  return await Redis.client.incr(`collab:${room}:changecount`);
}

export default { getCollabYdoc, setCollabYdoc, getCollabChat, addCollabChat, incrementCollabChangeCount };
