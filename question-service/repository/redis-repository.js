import redisClient from './redis.js';

const DISTINCT_CATEGORY_COMPLEXITY_KEY = 'category_complexity_set';

async function setDistinctCategoryComplexity(category, complexity) {
  await redisClient.sAdd(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

async function removeDistinctCategoryComplexity(category, complexity) {
  await redisClient.sRem(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

export default { setDistinctCategoryComplexity, removeDistinctCategoryComplexity };
