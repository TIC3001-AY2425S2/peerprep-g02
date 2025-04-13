export interface Collab {
  readonly _id: string;
  readonly code: string;
  readonly user1: string;
  readonly user2: string;
  readonly questionId: string;
  readonly status: boolean;
}

export interface CollabGetData {
  readonly userId: string;
}

export interface CollabGetResponseData {
  readonly collab: Collab;
}

export interface CollabResponseData<T> {
  message: string;
  data: T;
}
