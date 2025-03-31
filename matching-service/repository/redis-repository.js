import Redis from './redis.js';

const MATCH_STATUS_KEY = 'match:status';
const DISTINCT_CATEGORY_COMPLEXITY_KEY = 'category_complexity_set';

export async function setMatchStatus(userId, status) {
  await Redis.client.set(`${MATCH_STATUS_KEY}:${userId}`, status);
}

export async function getMatchStatus(userId) {
  return await Redis.client.get(`${MATCH_STATUS_KEY}:${userId}`);
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
