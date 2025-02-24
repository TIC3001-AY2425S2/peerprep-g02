import {
    createQuestion as _createQuestion,
    deleteQuestionById as _deleteQuestionById,
    findAllQuestions as _findAllQuestions,
    findQuestionByCategory as _findQuestionByCategory,
    findQuestionByComplexity as _findQuestionByComplexity,
    findQuestionByTitle as _findQuestionByTitle,
    updateQuestionById as _updateQuestionById,
  } from "../model/repository.js";

export async function createQuestion(req, res) {
    try {
      const { title, description, category, complexity } = req.body;
      if (title && description && category && complexity) {
        const existingQuestion = await _findQuestionByTitle(title);
        if (existingQuestion) {
          return res.status(409).json({ message: "Question already exists" });
        }
  
        const createdQuestion = await _createQuestion(title, description, category, complexity);
        return res.status(201).json({
          message: `Created new question ${title} successfully`,
          data: createdQuestion,
        });
      } else {
        return res.status(400).json({ message: "title and/or description and/or category and/or complexity are missing" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Unknown error when creating new question!" });
    }
  }
  