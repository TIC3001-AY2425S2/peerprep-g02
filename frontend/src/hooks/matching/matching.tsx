import api from '../../api';
import { MatchingPostData } from '../../types/matching';

export const startMatchmaking = async (data: MatchingPostData): Promise<void> => {
  try {
    await api.matching.start(data);
  } catch (error) {
    console.error('Error creating question: ', error);
    throw error;
  }
};
