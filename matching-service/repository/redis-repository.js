import Redis from './redis.js';

const MATCH_STATUS_KEY = 'match:status';
const MATCH_TIMER_KEY = 'match:timer';
const DISTINCT_CATEGORY_COMPLEXITY_KEY = 'category_complexity_set';
const QUEUE_TIMEOUT = process.env.QUEUE_TIMEOUT || 20;
const DEAD_LETTER_QUEUE_TIMEOUT = process.env.DEAD_LETTER_QUEUE_TIMEOUT || 10;

export async function setMatchStatus(userId, sessionId, status) {
  await Redis.client.set(`${MATCH_STATUS_KEY}:${userId}:${sessionId}`, status, { EX: 60 });
}

export async function getMatchStatus(userId, sessionId) {
  return await Redis.client.get(`${MATCH_STATUS_KEY}:${userId}:${sessionId}`);
}

export async function setMatchTimer(userId, sessionId) {
  // Set a key-value pair with TTL duration of entire matching duration.
  const totalTimerTTL = Number(QUEUE_TIMEOUT) + Number(DEAD_LETTER_QUEUE_TIMEOUT);
  await Redis.client.set(`${MATCH_TIMER_KEY}:${userId}:${sessionId}`, 'timer', { EX: totalTimerTTL });
}

export async function getMatchTimer(userId, sessionId) {
  // Retrieve TTL of key-value pair.
  return await Redis.client.ttl(`${MATCH_TIMER_KEY}:${userId}:${sessionId}`);
}

export async function isCategoryComplexityActive(category, complexity) {
  return await Redis.client.sIsMember(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

export async function isCategoryActive(category) {
  const categoryMembers = (await Redis.client.sMembers(DISTINCT_CATEGORY_COMPLEXITY_KEY)).filter((member) =>
    member.startsWith(`${category}:`),
  );
  return categoryMembers.length !== 0;
}

export async function setDistinctCategoryComplexity(category, complexity) {
  await Redis.client.sAdd(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

export async function removeDistinctCategoryComplexity(category, complexity) {
  await Redis.client.sRem(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}
