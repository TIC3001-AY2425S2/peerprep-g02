export interface MatchingPostData {
  readonly userId: string;
  readonly category: string;
  readonly complexity: string;
}

export enum MatchingStatusEnum {
  WAITING = 'WAITING',
  MATCHED = 'MATCHED',
  NO_MATCH = 'NO_MATCH',
  CANCELLED = 'CANCELLED',
}
