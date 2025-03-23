import { AxiosResponse } from 'axios';
import { MatchingPostData } from '../types/matching';
import { clientApi } from './client';

const URL = '/matching';

export async function start(data: MatchingPostData): Promise<AxiosResponse<void>> {
  return clientApi.post(`${URL}`, data);
}
