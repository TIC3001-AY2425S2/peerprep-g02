import { isValidObjectId } from 'mongoose';
import * as QuestionRepository from '../model/repository.js';
import { findDistinctCategoryAndComplexity } from '../model/repository.js';
import { default as RedisQuestionRepository, default as RedisRepository } from '../repository/redis-repository.js';
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
    await RedisRepository.setDeletedQuestion(deletedQuestion);
    // await session.commitTransaction();
    return deletedQuestion;
  } catch (err) {
    // await session.abortTransaction();
    throw err;
  } finally {
    // await session.endSession();
  }
}

async function editQuestion(questionId, title, description, category, complexity) {
  if (!isValidObjectId(questionId)) {
    throw new Error(`Question ${questionId} not found`);
  }

  const question = await QuestionRepository.findQuestionById(questionId);

  try {
    // check if new queues should be created
    await sendQueueUpdate('create', category, complexity);

    // check if existing queues should be deleted
    const originalCategories = question.category;
    const removedCategories = originalCategories.filter((element) => !category.includes(element));
    const categoriesToDelete = (
      await Promise.all(
        removedCategories.map(async (category) => {
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

    // update question
    const editedQuestion = await QuestionRepository.updateQuestionById(
      questionId,
      title,
      description,
      category,
      complexity,
    );

    return editedQuestion;
  } catch (err) {
    throw err;
  }
}

async function getQuestion(questionId) {
  if (!isValidObjectId(questionId)) {
    throw new Error(`Question not found`);
  }

  // Check the primary data source.
  const questionFromModel = await QuestionRepository.findQuestionById(questionId);
  if (questionFromModel) {
    return questionFromModel;
  }

  // Check Redis if primary data source returns no results. It may be deleted.
  const questionFromRedis = await RedisRepository.getDeletedQuestion(questionId);
  if (questionFromRedis) {
    console.log('QuestionService: Retrieved question from redis');
    return questionFromRedis;
  }

  throw new Error(`Question not found`);
}

async function getRandomQuestion(category, complexity) {
  const questionFromModel = await QuestionRepository.findRandomQuestionByCategoryAndComplexity(category, complexity);
  if (questionFromModel && questionFromModel.length >= 1) {
    return questionFromModel;
  }

  const questionFromRedis = await RedisRepository.getRandomDeletedQuestion(category, complexity);
  if (questionFromRedis) {
    console.log('QuestionService: Retrieved question from redis');
    return questionFromRedis;
  }

  throw new Error(`Question not found`);
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

export default {
  createQuestion,
  deleteQuestion,
  editQuestion,
  getQuestion,
  getRandomQuestion,
  populateDistinctCategoryComplexity,
};
