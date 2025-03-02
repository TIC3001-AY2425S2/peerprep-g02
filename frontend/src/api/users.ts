import { AxiosResponse } from 'axios';
import { User, UserDeletePostData, UserPostData, UserUpdatePostData } from '../types/users';
import { userClientApi } from './client';

const URL = '/users';

export async function create(data: UserPostData): Promise<AxiosResponse<User>> {
  return userClientApi.post(`${URL}`, data);
}

export async function update(data: UserUpdatePostData): Promise<AxiosResponse<User>> {
  return userClientApi.post(`${URL}/update`, data);
}

export async function remove(data: UserDeletePostData): Promise<AxiosResponse<User>> {
  return userClientApi.delete(`${URL}/delete`, { data });
}

export async function login(data: UserPostData): Promise<AxiosResponse<UserPostData>> {
  return userClientApi.post(`${URL}/login`, data);
}
