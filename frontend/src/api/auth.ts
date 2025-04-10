import { AxiosResponse } from 'axios';
import { AuthPostData, AuthPostResponseData, AuthResponseData } from '../types/auth';
import { clientApi } from './client';

const URL = '/auth';

export async function login(data: AuthPostData): Promise<AxiosResponse<AuthResponseData<AuthPostResponseData>>> {
  return clientApi.post(`${URL}/login`, data);
}
