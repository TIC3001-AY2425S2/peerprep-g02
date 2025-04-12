import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import { setMatchStatusIfStatusWaiting } from '../repository/redis-repository.js';
import CollabService from './CollabService.js';
import QuestionServiceApiProvider from './QuestionServiceApiProvider.js';

async function process(message) {
  const firstPlayer = message.players[0];
  const secondPlayer = message.players[1];
  const question = await QuestionServiceApiProvider.getRandomQuestion(firstPlayer.category, firstPlayer.complexity);
  await CollabService.createCollab(message.players, question._id);
  await Promise.all(
    message.players.map((player) =>
      setMatchStatusIfStatusWaiting(player.userId, player.sessionId, MatchingStatusEnum.MATCHED),
    ),
  );
}

export default { process };
