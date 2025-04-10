import { toast } from 'react-toastify';
import api from '../../api';
import { UsersPostData, UsersPostResponseData } from '../../types/users';

export const createUser = async (data: UsersPostData): Promise<UsersPostResponseData> => {
  try {
    const response = await api.users.create(data);
    toast.success(response.data.message);
    return response.data.data;
  } catch (error) {
    console.error('Error creating question: ', error);
    throw error;
  }
};
