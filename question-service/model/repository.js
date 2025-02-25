import QuestionModel from "./question-model.js";
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;

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

export async function findAllQuestions() {
  return QuestionModel.find();
}

export async function findDistinctCategory() {
  return QuestionModel.distinct("category");
}

export async function findDistinctComplexity() {
  return QuestionModel.distinct("complexity");
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
    { new: true },  // return the updated question
  );
}

export async function deleteQuestionById(questionId) {
  return QuestionModel.findByIdAndDelete(questionId);
}
