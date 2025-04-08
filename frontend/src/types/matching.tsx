export interface MatchingPostData {
  readonly userId: string;
  readonly category: string;
  readonly complexity: string;
}

export interface MatchingCancelPostData {
  readonly userId: string;
  readonly sessionId: string;
}

export interface MatchingResponseData<T> {
  message: string;
  data: T;
}

export interface MatchingSessionData {
  readonly sessionId: string;
}

export enum MatchingStatusEnum {
  WAITING = 'WAITING',
  MATCHED = 'MATCHED',
  NO_MATCH = 'NO_MATCH',
  CANCELLED = 'CANCELLED',
}
