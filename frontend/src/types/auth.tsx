export interface AuthPostData {
  readonly email: string;
  readonly password: string;
}

export interface AuthResponseData<T> {
  message: string;
  data: T;
}

export interface AuthPostResponseData {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly isAdmin: boolean;
  readonly createdAt: Date;
  readonly accessToken: string;
}
