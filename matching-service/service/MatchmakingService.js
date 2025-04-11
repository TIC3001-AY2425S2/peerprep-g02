import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import { isCategoryComplexityActive, setMatchStatus, setMatchTimer } from '../repository/redis-repository.js';
import UuidUtils from '../utils/UuidUtils.js';
import MessageSource from './MessageSource.js';

async function matchmake(userId, category, complexity) {
  if (!(await isCategoryComplexityActive(category, complexity))) {
    throw new Error('Category and Complexity no longer exists');
  }

  // Generate a sessionId for each matchmaking request so that when a user queues, the status is tied to the
  // session id and the user. Otherwise, the user cancel while message in flight and requeue again. It will
  // mess up the matchmaking since the 1st message will no longer be valid but treated as valid if we set to
  // just userId and status waiting.
  const sessionId = UuidUtils.generateUUID();
  await setMatchStatus(userId, sessionId, MatchingStatusEnum.WAITING);
  await setMatchTimer(userId, sessionId);
  await MessageSource.sendCategoryComplexityMessage({ userId, sessionId, category, complexity });
  return sessionId;
}

export default { matchmake };
