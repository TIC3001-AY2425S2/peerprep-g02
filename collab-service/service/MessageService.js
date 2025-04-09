import CollabService from './CollabService.js';
import QuestionServiceApiProvider from './QuestionServiceApiProvider.js';

async function process(message) {
  const firstPlayer = message.players[0];
  const question = await QuestionServiceApiProvider.getRandomQuestion(firstPlayer.category, firstPlayer.complexity);
  await CollabService.createCollab(message.players, question._id);
}

export default { process };
