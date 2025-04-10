import { AxiosResponse } from 'axios';

import { UsersPostData, UsersPostResponseData, UsersResponseData } from '../types/users';
import { clientApi } from './client';

const URL = '/users';

export async function create(data: UsersPostData): Promise<AxiosResponse<UsersResponseData<UsersPostResponseData>>> {
  return clientApi.post(`${URL}`, data);
}
