export interface User {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly isAdmin: string;
  readonly createdAt: Date;
}

export interface UserPostData {
  readonly email: string;
  readonly password: string;
  readonly displayname: string;
}

export interface UserCreatePostData {
  readonly email: string;
  readonly password: string;
  readonly displayname: string;
}

export interface UserUpdatePostData {
  readonly email: string;
  readonly password: string;
  readonly displayname: string;
}

export interface UserDeletePostData {
  readonly email: string;
}
