import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import { setMatchStatus } from '../repository/redis-match-repository.js';
import MessageSource from './MessageSource.js';

async function matchmake(userId, category, complexity) {
  const enqueueTime = Date.now();
  await setMatchStatus(userId, MatchingStatusEnum.WAITING);
  return MessageSource.sendCategoryComplexityMessage({ userId, category, complexity, enqueueTime });
}

export default { matchmake };
