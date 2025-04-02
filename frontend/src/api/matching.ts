import { AxiosResponse } from 'axios';
import { MatchingCancelPostData, MatchingPostData, MatchingResponseData, MatchingSessionData } from '../types/matching';
import { clientApi } from './client';

const URL = '/matching';

export async function start(data: MatchingPostData): Promise<AxiosResponse<MatchingResponseData<MatchingSessionData>>> {
  return clientApi.post(`${URL}`, data);
}

export async function cancel(data: MatchingCancelPostData): Promise<AxiosResponse<void>> {
  return clientApi.post(`${URL}/cancel`, data);
}
