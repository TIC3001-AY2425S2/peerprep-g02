import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

export const clientApi = Object.freeze({
  get: client.get,
  getByTitle: client.get,
  delete: client.delete,
  post: client.post,
  put: client.put,
  patch: client.patch,
});
