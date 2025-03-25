import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import { getMatchStatus, setMatchStatus } from '../repository/redis-match-repository.js';
import MessageConfig from './MessageConfig.js';
import QuestionServiceApiProvider from './QuestionServiceApiProvider.js';
import MessageSource from './MessageSource.js';

/**
 * Creates a message processor for a given valid window and name.
 * Each processor will have its own waiting state.
 */
function createMessageProcessor(validWindow, processorName) {
  let waitingUser = null;

  async function isUserCancelled(userId) {
    return (await getMatchStatus(userId)) === MatchingStatusEnum.CANCELLED;
  }

  async function attemptMatching(waitingUser, message, processorName) {
    // Both users must not be cancelled.
    const [waitingUserCancelled, currentUserCancelled] = await Promise.all([
      isUserCancelled(waitingUser.message.userId),
      isUserCancelled(message.userId),
    ]);
    if (waitingUserCancelled || currentUserCancelled) {
      return false;
    }

    // Update both users to MATCHED and frontend should not allow users to cancel at this point onwards.
    await Promise.all([
      setMatchStatus(waitingUser.message.userId, MatchingStatusEnum.MATCHED),
      setMatchStatus(message.userId, MatchingStatusEnum.MATCHED),
    ]);
    clearTimeout(waitingUser.timer);

    console.log(
      `${new Date().toISOString()} MessageService: Matched users (${processorName}) in ${message.category}: ${waitingUser.message.userId} and ${message.userId}`
    );

    await MessageSource.sendMatchedPlayersMessage([waitingUser.message, message]);
    return true;
  }

  function setWaitingUser(message, validWindow, elapsed, processorName) {
    const waitingUser = { message, timer: null };
    const remainingTime = validWindow - elapsed;

    waitingUser.timer = setTimeout(async () => {
      console.log(
        `${new Date().toISOString()} MessageService: Waiting user ${message.userId} in ${processorName} ${message.category} queue timed out.`
      );
      // Clear waiting user reference.
      clearWaitingUser();

      // If the processor is 'main', republish to a dead-letter queue only if not cancelled.
      if (processorName === 'main') {
        if (await isUserCancelled(message.userId)) {
          console.log(
            `${new Date().toISOString()} MessageService: User ${message.userId} cancelled during timeout, skipping further processing.`
          );
          return;
        }
        await MessageSource.sendCategoryMessage(message);
        return;
      }
      await setMatchStatus(message.userId, MatchingStatusEnum.NO_MATCH);
    }, remainingTime);

    console.log(
      `${new Date().toISOString()} MessageService: Stored waiting user (${processorName}) in ${message.category}: ${message.userId}`
    );

    return waitingUser;
  }

  function clearWaitingUser() {
    waitingUser = null;
  }

  return async function process(message) {
    const currentTime = Date.now();
    const elapsed = currentTime - message.enqueueTime;

    // Check if the current user has cancelled.
    if (await isUserCancelled(message.userId)) {
      console.log(
        `${new Date().toISOString()} MessageService: Current message user ${message.userId} is CANCELLED, skipping processing.`
      );
      return;
    }

    // If waiting user doesn't exist, set current user as waiting user.
    if (!waitingUser) {
      waitingUser = setWaitingUser(message, validWindow, elapsed, processorName);
      return;
    }

    // A waiting user exists, try to match.
    if (await isUserCancelled(waitingUser.message.userId)) {
      clearTimeout(waitingUser.timer);
      console.log(
        `${new Date().toISOString()} MessageService: Waiting user ${waitingUser.message.userId} has CANCELLED, clearing waiting slot.`
      );
      clearWaitingUser();
      // Now set the current message as the new waiting user and exit.
      waitingUser = setWaitingUser(message, validWindow, elapsed, processorName);
      return;
    }

    // Attempt to match waiting user with the current message.
    const matched = await attemptMatching(waitingUser, message, processorName);
    if (matched) {
      clearWaitingUser();
      return;
    }

    // If matching did not occur, update waiting user with the current message.
    waitingUser = setWaitingUser(message, validWindow, elapsed, processorName);
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
  // TODO: Maybe park this in collaboration service to offload queue processing.
  const firstPlayer = message.players[0];
  const question = await QuestionServiceApiProvider.getRandomQuestion(firstPlayer.category, firstPlayer.complexity);

  console.log('Sending both players to collaboration service');
  // await for collaboration service to be done then set the matched status.

  // Set match status for player all at once then wait for all of them to resolve
  // Actually only have 2 players but player1, player2 didn't sound right so no idea
  // what to name them so might as well put in array lol.
  await Promise.all(message.players.map((player) => setMatchStatus(player.userId, MatchingStatusEnum.MATCHED)));
}

export default {
  createNormalProcessor,
  createDeadLetterProcessor,
  processMatchedPlayers,
};
