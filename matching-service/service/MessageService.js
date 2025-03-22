import MessageConfig from './MessageConfig.js';
import { setMatchStatus } from '../repository/redis-match-repository.js';
import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';

/**
 * Creates a message processor for a given valid window and name.
 * Each processor will have its own waiting state.
 */
function createMessageProcessor(validWindow, processorName) {
  let waitingUser = null;

  return async function process(message) {
    const currentTime = Date.now();
    const elapsed = currentTime - message.enqueueTime;

    if (!waitingUser) {
      waitingUser = { message, timer: null };
      const remainingTime = validWindow - elapsed;
      waitingUser.timer = setTimeout(async () => {
        console.log(
          `${new Date().toISOString()} MessageService: Waiting user ${message.userId} in ${processorName} ${message.category} queue timed out.`,
        );
        waitingUser = null;
        // Send message to dead-letter queue.
        if (processorName !== 'dead-letter') {
          const channel = await MessageConfig.getChannel();
          message.enqueueTime = Date.now();
          channel.publish(MessageConfig.EXCHANGE, message.category, Buffer.from(JSON.stringify(message)));
        }
      }, remainingTime);
      console.log(
        `${new Date().toISOString()} MessageService: Stored waiting user (${processorName}) in ${message.category}: ${message.userId}`,
      );
      return;
    }

    // Clear the timer for the waiting user to avoid race conditions.
    clearTimeout(waitingUser.timer);
    console.log(
      `${new Date().toISOString()} MessageService: Matched users (${processorName}) in ${message.category}: ${waitingUser.message.userId} and ${message.userId}`,
    );
    const channel = await MessageConfig.getChannel();
    const matchedPlayersMessage = { players: [waitingUser.message, message] };
    channel.publish(MessageConfig.EXCHANGE, MessageConfig.MATCHED_PLAYERS_QUEUE_NAME, Buffer.from(JSON.stringify(matchedPlayersMessage)));
    waitingUser = null;
  };
}

// Isolate the instances so each consumer will have their own waitingUser, so they don't end up sharing.
function createNormalProcessor() {
  return createMessageProcessor(MessageConfig.QUEUE_TIMEOUT * 1000, 'main');
}

function createDeadLetterProcessor() {
  return createMessageProcessor(MessageConfig.DEAD_LETTER_QUEUE_TIMEOUT * 1000, 'dead-letter');
}

async function processMatchedPlayers(message) {
  console.log('Sending both players to collaboration service');
  // await for collaboration service to be done then set the matched status.

  // Set match status for player all at once then wait for all of them to resolve
  // Actually only have 2 players but player1, player2 didn't sound right so no idea
  // what to name them so might as well put in array lol.
  await Promise.all(
    message.players.map(player =>
      setMatchStatus(player.userId, MatchingStatusEnum.MATCHED)
    )
  );
}

export default {
  createNormalProcessor,
  createDeadLetterProcessor,
  processMatchedPlayers,
};
