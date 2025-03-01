import axios from 'axios';
import * as questions from './questions';

// Create axios instance with your backend URL
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8001',
});

export const getQuestions = () =>
  instance.get('/questions')
    .then(response => {
      console.log('API getQuestions response:', response.data);
      return response.data.data; // now returns the array of questions
    });

export const deleteQuestion = (id: string) =>
  instance.delete(`/questions/${id}`);

const api = {
  questions: {
    getAll: getQuestions,
    remove: (data: { _id: string }) => deleteQuestion(data._id),
  },
};

// Set api as immutable
Object.freeze(api);

export default api;
