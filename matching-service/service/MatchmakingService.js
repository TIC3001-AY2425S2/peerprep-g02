import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import { isCategoryComplexityActive, setMatchStatus } from '../repository/redis-repository.js';
import MessageSource from './MessageSource.js';

async function matchmake(userId, category, complexity) {
  if (!(await isCategoryComplexityActive(category, complexity))) {
    throw new Error('Category and Complexity no longer exists');
  }

  const enqueueTime = Date.now();
  await setMatchStatus(userId, MatchingStatusEnum.WAITING);
  return MessageSource.sendCategoryComplexityMessage({ userId, category, complexity, enqueueTime });
}

export default { matchmake };
