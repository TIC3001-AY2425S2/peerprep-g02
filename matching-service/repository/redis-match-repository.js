import redisClient from './redis.js';

const MATCH_STATUS_KEY = 'match:status';

export async function setMatchStatus(userId, status) {
  await redisClient.set(`${MATCH_STATUS_KEY}:${userId}`, status);
}

export async function getMatchStatus(userId) {
  return await redisClient.get(`${MATCH_STATUS_KEY}:${userId}`);
}
