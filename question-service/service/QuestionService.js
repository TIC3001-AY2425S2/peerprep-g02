import mongoose, { isValidObjectId } from 'mongoose';
import * as QuestionRepository from '../model/repository.js';
import { findDistinctCategoryAndComplexity } from '../model/repository.js';
import RedisQuestionRepository from '../repository/redis-repository.js';
import redisClient from '../repository/redis.js';
import MessageSource from './MessageSource.js';

async function sendQueueUpdate(type, category, complexity) {
  try {
    await MessageSource.sendQueueUpdate(type, category, complexity);
  } catch (err) {
    throw new Error('Error creating queue');
  }
}

async function setDistinctCategoryComplexity(category, complexity) {
  // Update redis category + complexity set with category and complexity.
  // It doesn't matter if it exists already since this is a set (unique).
  try {
    await RedisQuestionRepository.setDistinctCategoryComplexity(category, complexity);
  } catch (err) {
    throw new Error('Error in redis publisher create queue');
  }
}

async function createQuestion(title, description, category, complexity) {
  if (!title || !description || !category || !complexity) {
    throw new Error('Missing required fields');
  }

  const existingQuestion = await QuestionRepository.findQuestionByTitle(title);
  if (existingQuestion) {
    throw new Error('Question already exists');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  const multi = redisClient.multi();

  // If any error occurs during the question creation, no question is created.
  try {
    await sendQueueUpdate('create', category, complexity);

    const createdQuestion = await QuestionRepository.createQuestion(title, description, category, complexity).session(
      session,
    );

    await setDistinctCategoryComplexity(category, complexity);

    await session.commitTransaction();
    await multi.exec();

    return createdQuestion;
  } catch (err) {
    await session.abortTransaction();
    multi.discard();
    throw err;
  } finally {
    await session.endSession();
  }
}

async function deleteQuestion(questionId) {
  if (!isValidObjectId(questionId)) {
    throw new Error(`Question ${questionId} not found`);
  }

  const question = await QuestionRepository.findQuestionById(questionId);

  const session = await mongoose.startSession();
  session.startTransaction();
  const multi = redisClient.multi();

  // If any error occurs during the question creation, no question is created.
  try {
    // Question category is an array of values.
    const deletedQuestion = await QuestionRepository.deleteQuestionById(questionId).session(session);

    await Promise.all(
      question.category.map(async (category) => {
        const exists = await QuestionRepository.checkCategoryComplexityExists(category, question.complexity, session);
        if (!exists) {
          await Promise.all([
            sendQueueUpdate('delete', category, question.complexity),
            RedisQuestionRepository.removeDistinctCategoryComplexity(category, question.complexity),
          ]);
        }
      }),
    );

    await session.commitTransaction();
    await multi.exec();

    return deletedQuestion;
  } catch (err) {
    await session.abortTransaction();
    multi.discard();
    throw err;
  } finally {
    await session.endSession();
  }
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

export default { createQuestion, deleteQuestion, populateDistinctCategoryComplexity };
