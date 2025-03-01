import api from '../../api';
import { Question,QuestionDeleteData,QuestionPostData,QuestionPatchData } from '../../types/questions';

export const createQuestion = async (data: QuestionPostData): Promise<Question> => {
  try {
    const response = await api.questions.create(data);
    return response.data;
  } catch (error) {
    console.error('Error creating question: ', error);
    throw error;
  }
};

export const getQuestion = async (ids?: String): Promise<Question[]> => {
  try {
    const response = ids ? await api.questions.get(ids) : await api.questions.get();
    return response.data.data;
  } catch (error) {
    console.error('Error getting question: ', error);
    throw error;
  }
};


export const updateQuestion = async (data: QuestionPatchData): Promise<Question> => {
  try {
    const response = await api.questions.update(data);
    return response.data;
  } catch (error) {
    console.error('Error updating question: ', error);
    throw error;
  }
};

export const deleteQuestion = async (data: QuestionDeleteData): Promise<Question> => {
  try {
    const response = await api.questions.remove(data);
    return response.data;
  } catch (error) {
    console.error('Error deleting question: ', error);
    throw error;
  }
};
