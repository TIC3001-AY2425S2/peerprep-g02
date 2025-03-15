import MatchmakingService from '../service/MatchmakingService.js';

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
