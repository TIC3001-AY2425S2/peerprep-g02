import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

client.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const clientApi = Object.freeze({
  get: client.get,
  getByTitle: client.get,
  delete: client.delete,
  post: client.post,
  put: client.put,
  patch: client.patch,
});
