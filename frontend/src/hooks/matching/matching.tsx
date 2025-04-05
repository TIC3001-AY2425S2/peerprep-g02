import { toast } from 'react-toastify';
import api from '../../api';
import { MatchingCancelPostData, MatchingPostData, MatchingSessionData } from '../../types/matching';

export const startMatchmaking = async (data: MatchingPostData): Promise<MatchingSessionData> => {
  try {
    const response = await api.matching.start(data);
    toast.success(response.data.message);
    return response.data.data;
  } catch (error) {
    console.error('Error creating question: ', error);
    throw error;
  }
};

export const cancelMatchmaking = async (data: MatchingCancelPostData): Promise<void> => {
  try {
    await api.matching.cancel(data);
    if(data.reason === 'timeout') {
      toast.error('Matchmaking timed out. Please try again.');
    }else{
      toast.error('Matchmaking cancelled.');
    }
  } catch (error) {
    console.error('Error creating question: ', error);
    throw error;
  }
};

