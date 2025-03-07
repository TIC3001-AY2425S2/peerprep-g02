import { AxiosResponse } from 'axios';
import { Question, QuestionDeleteData, QuestionPatchData, QuestionPostData } from '../types/questions';
import { questionClientApi } from './client';

const URL = '/questions';

export async function create(data: QuestionPostData): Promise<AxiosResponse<Question>> {
  return questionClientApi.post(`${URL}`, data);
}

export async function get(data?: String): Promise<AxiosResponse<any>> {
  const url = data ? `${URL}/${data}` : `${URL}`;
  return questionClientApi.get(url);
}

export async function getByTitle(data?: String): Promise<AxiosResponse<any>> {
  return questionClientApi.getByTitle(`${URL}/title/${data}`);
}

export async function update(data: QuestionPatchData): Promise<AxiosResponse<Question>> {
  return questionClientApi.patch(`${URL}/${data._id}`, data);
}

export async function remove(data: QuestionDeleteData): Promise<AxiosResponse<Question>> {
  return questionClientApi.delete(`${URL}/${data._id}`);
}
