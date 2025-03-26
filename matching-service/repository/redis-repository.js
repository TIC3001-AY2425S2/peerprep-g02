import redisClient from './redis.js';

const MATCH_STATUS_KEY = 'match:status';
const DISTINCT_CATEGORY_COMPLEXITY_KEY = 'category_complexity_set';

export async function setMatchStatus(userId, status) {
  await redisClient.set(`${MATCH_STATUS_KEY}:${userId}`, status);
}

export async function getMatchStatus(userId) {
  return await redisClient.get(`${MATCH_STATUS_KEY}:${userId}`);
}

export async function isCategoryComplexityActive(category, complexity) {
  return await redisClient.sIsMember(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

export async function isCategoryActive(category) {
  const categoryMembers = (await redisClient.sMembers(DISTINCT_CATEGORY_COMPLEXITY_KEY)).filter((member) =>
    member.startsWith(`${category}:`),
  );
  return categoryMembers.length === 0;
}
