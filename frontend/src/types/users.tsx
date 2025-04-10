export interface UsersPostData {
  readonly email: string;
  readonly username: string;
  readonly password: string;
}

export interface UsersResponseData<T> {
  message: string;
  data: T;
}

export interface UsersPostResponseData {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly isAdmin: boolean;
  readonly createdAt: Date;
}
