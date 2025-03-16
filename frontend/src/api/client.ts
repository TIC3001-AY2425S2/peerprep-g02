import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const questionClient = axios.create({
  baseURL: BASE_URL,
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
