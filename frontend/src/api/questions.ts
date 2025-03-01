import { AxiosResponse } from 'axios';
import { questionClientApi } from './client';
import { Question, QuestionDeleteData, QuestionPatchData, QuestionPostData } from '../types/questions';

const URL = '/questions';

export async function getAll(): Promise<AxiosResponse<Question[]>> {
  return questionClientApi.get(`${URL}`);
}

export async function create(data: QuestionPostData): Promise<AxiosResponse<Question>> {
  return questionClientApi.post(`${URL}`, data);
}

export async function update(data: QuestionPatchData): Promise<AxiosResponse<Question>> {
  return questionClientApi.patch(`${URL}/${data._id}`, data);
}

export async function remove(data: QuestionDeleteData): Promise<AxiosResponse<Question>> {
  return questionClientApi.delete(`${URL}/delete`, { data });
}

