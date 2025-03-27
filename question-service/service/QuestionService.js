import { isValidObjectId } from 'mongoose';
import * as QuestionRepository from '../model/repository.js';
import { findDistinctCategoryAndComplexity } from '../model/repository.js';
import RedisQuestionRepository from '../repository/redis-repository.js';
import MessageSource from './MessageSource.js';

async function sendQueueUpdate(type, category, complexity) {
  try {
    await MessageSource.sendQueueUpdate(type, category, complexity);
  } catch (err) {
    throw new Error('Error creating queue');
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

  // Transaction requires another form of mongodb and that is a pain in the ass to set up with single command dockerfile.
  // const session = await mongoose.startSession();
  // await session.startTransaction();

  // If any error occurs during the question creation, no question is created.
  try {
    await sendQueueUpdate('create', category, complexity);
    const createdQuestion = await QuestionRepository.createQuestion(title, description, category, complexity);

    // await session.commitTransaction();
    return createdQuestion;
  } catch (err) {
    // await session.abortTransaction();
    throw err;
  } finally {
    // await session.endSession();
  }
}

async function deleteQuestion(questionId) {
  if (!isValidObjectId(questionId)) {
    throw new Error(`Question ${questionId} not found`);
  }

  const question = await QuestionRepository.findQuestionById(questionId);

  // Transaction requires another form of mongodb and that is a pain in the ass to set up with single command dockerfile.
  // const session = await mongoose.startSession();
  // await session.startTransaction();

  // If any error occurs during the question creation, no question is created.
  try {
    // Category is an array of values.

    const categoriesToDelete = (
      await Promise.all(
        question.category.map(async (category) => {
          const isLast = await QuestionRepository.isLastCategoryComplexity(category, question.complexity);
          return isLast ? category : null;
        }),
      )
    ).filter(Boolean);

    // If there are any categories and complexities to delete, delete from redis and send a single delete update with the array.
    if (categoriesToDelete.length > 0) {
      await Promise.all(
        categoriesToDelete.map((category) =>
          RedisQuestionRepository.removeDistinctCategoryComplexity(category, question.complexity),
        ),
      );
      await sendQueueUpdate('delete', categoriesToDelete, question.complexity);
    }

    const deletedQuestion = await QuestionRepository.deleteQuestionById(questionId);
    // await session.commitTransaction();
    return deletedQuestion;
  } catch (err) {
    // await session.abortTransaction();
    throw err;
  } finally {
    // await session.endSession();
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
