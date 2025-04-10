import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import Redis from './redis.js';

const MATCH_STATUS_KEY = 'match:status';
const MATCH_TIMER_KEY = 'match:timer';
const DISTINCT_CATEGORY_COMPLEXITY_KEY = 'category_complexity_set';
const QUEUE_TIMEOUT = process.env.QUEUE_TIMEOUT || 30;

export async function setMatchStatus(userId, sessionId, status) {
  await Redis.client.set(`${MATCH_STATUS_KEY}:${userId}:${sessionId}`, status, { EX: 60 });
}

export async function getMatchStatus(userId, sessionId) {
  return await Redis.client.get(`${MATCH_STATUS_KEY}:${userId}:${sessionId}`);
}

export async function setMatchTimer(userId, sessionId) {
  // Set a key-value pair with TTL duration of entire matching duration.
  await Redis.client.set(`${MATCH_TIMER_KEY}:${userId}:${sessionId}`, 'timer', { EX: QUEUE_TIMEOUT });
}

export async function getMatchTimer(userId, sessionId) {
  // Retrieve TTL of key-value pair.
  return await Redis.client.ttl(`${MATCH_TIMER_KEY}:${userId}:${sessionId}`);
}

export async function isCategoryComplexityActive(category, complexity) {
  return await Redis.client.sIsMember(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

export async function setDistinctCategoryComplexity(category, complexity) {
  await Redis.client.sAdd(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

export async function removeDistinctCategoryComplexity(category, complexity) {
  await Redis.client.sRem(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

export async function atomicMatch(userId1, sessionId1, userId2, sessionId2) {
  const luaScript = `
    local status1 = redis.call("GET", KEYS[1])
    local status2 = redis.call("GET", KEYS[2])
    if status1 == ARGV[1] and status2 == ARGV[1] then
      redis.call("SET", KEYS[1], ARGV[2])
      redis.call("SET", KEYS[2], ARGV[2])
      return 1
    else
      return 0
    end
  `;
  return await Redis.client.eval(luaScript, {
    keys: [`${MATCH_STATUS_KEY}:${userId1}:${sessionId1}`, `${MATCH_STATUS_KEY}:${userId2}:${sessionId2}`],
    arguments: [MatchingStatusEnum.WAITING, MatchingStatusEnum.MATCHED],
  });
}
