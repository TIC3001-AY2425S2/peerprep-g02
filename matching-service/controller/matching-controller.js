import MatchmakingService from '../service/MatchmakingService.js';

export async function startMatchmake(req, res) {
  try {
    const { userId, category, complexity } = req.body;
    // TODO: Fix api call flow
    MatchmakingService.matchmake(userId, category, complexity);
    return res.status(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when getting question!' });
  }
}
