import { toast } from 'react-toastify';
import api from '../../api';
import { AuthPostData, AuthPostResponseData } from '../../types/auth';

export const login = async (data: AuthPostData): Promise<AuthPostResponseData> => {
  try {
    const response = await api.auth.login(data);
    toast.success(response.data.message);
    return response.data.data;
  } catch (error) {
    console.error('Error logging in: ', error);
    throw error;
  }
};
