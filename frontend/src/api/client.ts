import axios from 'axios';

const USER_BASE_URL = process.env.REACT_APP_USER_BASE_URL || 'http://localhost:8080';
const QUESTION_BASE_URL = process.env.REACT_APP_QUESTION_BASE_URL || 'http://localhost:8081';

const userClient = axios.create({
  baseURL: USER_BASE_URL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

const questionClient = axios.create({
  baseURL: QUESTION_BASE_URL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

export const userClientApi = Object.freeze({
  get: userClient.get,
  delete: userClient.delete,
  post: userClient.post,
  put: userClient.put,
  patch: userClient.patch,
});

export const questionClientApi = Object.freeze({
  get: questionClient.get,
  delete: questionClient.delete,
  post: questionClient.post,
  put: questionClient.put,
  patch: questionClient.patch,
});
