import { AxiosResponse } from 'axios';
import {
  QuestionCategoriesComplexitiesData,
  QuestionDeleteData,
  QuestionPatchData,
  QuestionPostData,
  QuestionResponseData,
} from '../types/questions';
import { clientApi } from './client';

const URL = '/questions';

export async function create(data: QuestionPostData): Promise<AxiosResponse<any>> {
  return clientApi.post(`${URL}`, data);
}

export async function get(data?: String): Promise<AxiosResponse<any>> {
  const url = data ? `${URL}/${data}` : `${URL}`;
  return clientApi.get(url);
}

export async function update(data: QuestionPatchData): Promise<AxiosResponse<any>> {
  return clientApi.patch(`${URL}/${data._id}`, data);
}

export async function remove(data: QuestionDeleteData): Promise<AxiosResponse<any>> {
  return clientApi.delete(`${URL}/${data._id}`);
}

export async function getCategoriesAndComplexities(): Promise<
  AxiosResponse<QuestionResponseData<QuestionCategoriesComplexitiesData[]>>
> {
  return clientApi.get(`${URL}/categories/complexities`);
}
