import { AxiosResponse } from 'axios';
import {
  Question,
  QuestionCategoriesComplexitiesData,
  QuestionDeleteData,
  QuestionPatchData,
  QuestionPostData,
  QuestionResponseData,
} from '../types/questions';
import { clientApi } from './client';

const URL = '/questions';

export async function create(data: QuestionPostData): Promise<AxiosResponse<Question>> {
  return clientApi.post(`${URL}`, data);
}

export async function get(data?: String): Promise<AxiosResponse<any>> {
  const url = data ? `${URL}/${data}` : `${URL}`;
  return clientApi.get(url);
}

export async function getByTitle(data?: String): Promise<AxiosResponse<any>> {
  return clientApi.getByTitle(`${URL}/title/${data}`);
}

export async function update(data: QuestionPatchData): Promise<AxiosResponse<Question>> {
  return clientApi.patch(`${URL}/${data._id}`, data);
}

export async function remove(data: QuestionDeleteData): Promise<AxiosResponse<Question>> {
  return clientApi.delete(`${URL}/${data._id}`);
}

export async function getCategoriesAndComplexities(): Promise<
  AxiosResponse<QuestionResponseData<QuestionCategoriesComplexitiesData[]>>
> {
  return clientApi.get(`${URL}/categories/complexities`);
}
