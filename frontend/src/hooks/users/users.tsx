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
export const updateProfile = async (id: string, data: any): Promise<UsersPostResponseData> => {
  try {
    const response = await api.users.update(id, data);
    toast.success(response.data.message);
    return response.data.data;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};

export const deleteAccount = async (id: string): Promise<void> => {
  try {
    await api.users.remove(id);
    toast.success('Account deleted successfully');
  } catch (error) {
    console.error('Deletion failed:', error);
    throw error;
  }
};
