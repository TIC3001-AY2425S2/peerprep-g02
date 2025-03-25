import * as QuestionRepository from '../model/repository.js';
import RedisQuestionRepository from '../repository/redis-question-repository.js';
import { findDistinctCategoryAndComplexity } from '../model/repository.js';

async function createQuestion(session, title, description, category, complexity) {
  if (!title || !description || !category || !complexity) {
    throw new Error('title and/or description and/or category and/or complexity');
  }

  const existingQuestion = await QuestionRepository.findQuestionByTitle(title).session(session);
  if (existingQuestion) {
    throw new Error('Question already exists');
  }

  // Attempt to create question and queue.
  // If something goes wrong, the question is not created.
  const createdQuestion = await QuestionRepository.createQuestion(title, description, category, complexity).session(session);
  try {
    await RedisQuestionRepository.setDistinctCategoryComplexity(category, complexity);
  } catch (err) {
    throw new Error(`Error in redis insertion`);
  }

  return createdQuestion;
}

async function populateDistinctCategoryComplexity() {
  try {
    const categoryComplexityList = await findDistinctCategoryAndComplexity();
    for (const { category, complexities } of categoryComplexityList) {
      for (const complexity of complexities) {
        await RedisQuestionRepository.setDistinctCategoryComplexity(category, complexity);
      }
    }
    console.log('Redis populated with unique category/complexity pairs.');
  } catch (err) {
    console.error('Error populating Redis:', err);
  }
}


export default { createQuestion, populateDistinctCategoryComplexity };