import { AxiosResponse } from 'axios';

import { UsersPostData, UsersPostResponseData, UsersResponseData } from '../types/users';
import { clientApi } from './client';

const URL = '/users';

export async function create(data: UsersPostData): Promise<AxiosResponse<UsersResponseData<UsersPostResponseData>>> {
  return clientApi.post(`${URL}`, data);
}

export async function update(id: string, data: any): Promise<AxiosResponse<UsersResponseData<UsersPostResponseData>>> {
  return clientApi.put(`${URL}/${id}`, data);
}

export async function remove(id: string): Promise<AxiosResponse<void>> {
  return clientApi.delete(`${URL}/${id}`);
}
