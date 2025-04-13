import Redis from './redis.js';

const DISTINCT_CATEGORY_COMPLEXITY_KEY = 'category_complexity_set';
const DELETED_QUESTION_KEY = 'deleted:question';

async function setDistinctCategoryComplexity(category, complexity) {
  await Redis.client.sAdd(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

async function removeDistinctCategoryComplexity(category, complexity) {
  await Redis.client.sRem(DISTINCT_CATEGORY_COMPLEXITY_KEY, `${category}:${complexity}`);
}

async function getDeletedQuestion(questionId) {
  const keys = await Redis.client.keys(`${DELETED_QUESTION_KEY}:*:${questionId}`);
  if (!keys || keys.length === 0) {
    return null;
  }

  const questionString = await Redis.client.get(keys[0]);
  return JSON.parse(questionString);
}

async function setDeletedQuestion(question) {
  const questionId = question._id.toString();
  const category = question.category;
  const complexity = question.complexity;
  await Redis.client.set(`${DELETED_QUESTION_KEY}:${category}:${complexity}:${questionId}`, JSON.stringify(question));
}

async function getRandomDeletedQuestion(category, complexity) {
  // Retrieve all keys that match the prefix.
  const keys = await Redis.client.keys(`${DELETED_QUESTION_KEY}:${category}:${complexity}:*`);
  if (!keys || keys.length === 0) {
    return null;
  }

  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const question = await Redis.client.get(randomKey);
  return JSON.parse(question);
}

export default {
  setDistinctCategoryComplexity,
  removeDistinctCategoryComplexity,
  getDeletedQuestion,
  setDeletedQuestion,
  getRandomDeletedQuestion,
};
