import { toast } from 'react-toastify';
import api from '../../api';
import { CollabGetData, CollabGetResponseData } from '../../types/collab';

export const getCollab = async (data: CollabGetData): Promise<CollabGetResponseData> => {
  try {
    const response = await api.collab.get(data);
    toast.success(response.data.message);
    return response.data.data;
  } catch (error) {
    console.error('Error creating question: ', error);
    throw error;
  }
};
