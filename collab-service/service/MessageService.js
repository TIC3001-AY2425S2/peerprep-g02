import CollabRepository from '../model/collab-repository.js';
import QuestionServiceApiProvider from './QuestionServiceApiProvider.js';

async function process(message) {
  const firstPlayer = message.players[0];
  const secondPlayer = message.players[1];
  const question = await QuestionServiceApiProvider.getRandomQuestion(firstPlayer.category, firstPlayer.complexity);
  const collab = await CollabRepository.createCollab(firstPlayer.userId, secondPlayer.userId, question._id);
  console.log(`MessageService: Created collab ${collab}`);
  // await for collaboration service to be done then set the matched status.
}

export default { process };
