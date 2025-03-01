import api from '../../api';
import { login } from '../../localStorage';
import { User, UserCreatePostData, UserDeletePostData, UserPostData, UserUpdatePostData } from '../../types/users';

export const loginUser = async (data: UserPostData): Promise<any> => {
  try {
    const response = await api.users.login(data);
    login(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (data: UserCreatePostData): Promise<User> => {
  try {
    const response = await api.users.create(data);
    return response.data;
  } catch (error) {
    console.error('Error creating user: ', error);
    throw error;
  }
};

export const updateUser = async (data: UserUpdatePostData): Promise<User> => {
  try {
    const response = await api.users.update(data);
    return response.data;
  } catch (error) {
    console.error('Error updating user: ', error);
    throw error;
  }
};

export const deleteUser = async (data: UserDeletePostData): Promise<User> => {
  try {
    const response = await api.users.remove(data);
    return response.data;
  } catch (error) {
    console.error('Error deleting user: ', error);
    throw error;
  }
};
