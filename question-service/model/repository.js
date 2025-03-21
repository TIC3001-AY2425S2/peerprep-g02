import 'dotenv/config';
import { connect } from 'mongoose';
import QuestionModel from './question-model.js';

export async function connectToDB() {
  let mongoDBUri;

  switch (process.env.ENV) {
    case 'PROD':
      mongoDBUri = process.env.DB_CLOUD_URI;
      break;
    case 'DOCKER':
      mongoDBUri = process.env.DB_DOCKER_URI;
      break;
    default:
      mongoDBUri = process.env.DB_LOCAL_URI;
  }

  await connect(mongoDBUri);
}

export async function createQuestion(title, description, category, complexity) {
  return new QuestionModel({ title, description, category, complexity }).save();
}

export async function findQuestionByTitle(title) {
  return QuestionModel.findOne({ title });
}

export async function findQuestionByCategory(category) {
  return QuestionModel.find({ category });
}

export async function findQuestionByComplexity(complexity) {
  return QuestionModel.find({ complexity });
}

export async function findQuestionById(questionId) {
  return QuestionModel.findById(questionId);
}

export async function findAllQuestions() {
  return QuestionModel.find();
}

export async function findDistinctCategory() {
  return QuestionModel.distinct('category');
}

export async function findDistinctComplexity() {
  return QuestionModel.distinct('complexity');
}

export async function updateQuestionById(QuestionId, title, description, category, complexity) {
  return QuestionModel.findByIdAndUpdate(
    QuestionId,
    {
      $set: {
        title,
        description,
        category,
        complexity,
      },
    },
    {
      new: true, // return the updated document
      runValidators: true,
    }, // run validators on update
  );
}

export async function deleteQuestionById(questionId) {
  return QuestionModel.findByIdAndDelete(questionId);
}

// check if a question has this category-complexity combination
export async function checkCategoryComplexityExists(category, complexity) {
  const exists = await QuestionModel.exists({ category, complexity });
  return !!exists; // convert to boolean
}
