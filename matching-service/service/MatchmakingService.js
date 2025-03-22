import MessageSource from './MessageSource.js';
import { setMatchStatus } from '../repository/redis-match-repository.js';
import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';

async function matchmake(userId, category, complexity) {
  const enqueueTime = Date.now();
  await setMatchStatus(userId, MatchingStatusEnum.WAITING);
  return MessageSource.sendMessage({ userId, category, complexity, enqueueTime });
}

export default { matchmake };
