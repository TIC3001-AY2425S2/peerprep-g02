import axios from 'axios';

const QUESTION_BASE_URL = process.env.REACT_APP_QUESTION_BASE_URL || 'http://localhost:8001';

const questionClient = axios.create({
  baseURL: QUESTION_BASE_URL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

export const questionClientApi = Object.freeze({
  get: questionClient.get,
  getByTitle: questionClient.get,
  delete: questionClient.delete,
  post: questionClient.post,
  put: questionClient.put,
  patch: questionClient.patch,
});
