import { AxiosResponse } from 'axios';
import { CollabGetData, CollabGetResponseData, CollabResponseData } from '../types/collab';
import { clientApi } from './client';

const URL = '/collab';

export async function get(data: CollabGetData): Promise<AxiosResponse<CollabResponseData<CollabGetResponseData>>> {
  return clientApi.get(`${URL}`, { params: data });
}
