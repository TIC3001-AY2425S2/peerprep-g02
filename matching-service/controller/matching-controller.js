import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import { setMatchStatus } from '../repository/redis-repository.js';
import MatchmakingService from '../service/MatchmakingService.js';

export async function startMatchmake(req, res) {
  try {
    const { userId, category, complexity } = req.body;
    const sessionId = await MatchmakingService.matchmake(userId, category, complexity);
    return res.status(200).json({ message: `sessionId: ${sessionId}`, data: { sessionId } });
  } catch (err) {
    console.log('Error encountered while matching: ', err);
    return res.status(500).json({ message: err.message });
  }
}

export async function cancelMatchmake(req, res) {
  try {
    const { userId, sessionId } = req.body;
    console.log(`Message Controller: User ${userId} with session ${sessionId} has cancelled`);
    await setMatchStatus(userId, sessionId, MatchingStatusEnum.CANCELLED);
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error while cancel matching!' });
  }
}
