import MatchmakingService from '../service/MatchmakingService.js';
import { setMatchStatus } from '../repository/redis-match-repository.js';
import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';

export async function startMatchmake(req, res) {
  try {
    const { userId, category, complexity } = req.body;
    MatchmakingService.matchmake(userId, category, complexity);
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when matching!' });
  }
}

export async function cancelMatchmake(req, res) {
  try {
    const userId = req.params.userId;
    await setMatchStatus(userId, MatchingStatusEnum.CANCELLED);
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when matching!' });
  }
}
