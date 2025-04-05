import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import {
  getMatchStatus,
  isCategoryActive,
  isCategoryComplexityActive,
  setMatchStatus,
} from '../repository/redis-repository.js';
import MessageConfig from './MessageConfig.js';
import MessageSource from './MessageSource.js';

/**
 * Creates a message processor for a given valid window and name.
 * Each processor will have its own waiting state.
 */
function createMessageProcessor(validWindow, processorName) {
  let waitingUser = null;

  async function shouldProcessMessage(message) {
    const { category, complexity } = message;
    return (await isCategoryComplexityActive(category, complexity)) || (await isCategoryActive(category));
  }

  async function isUserCancelled(userId, sessionId) {
    return (await getMatchStatus(userId, sessionId)) === MatchingStatusEnum.CANCELLED;
  }

  async function attemptMatching(waitingUser, message, processorName) {
    // Update both users to MATCHED and frontend should not allow users to cancel at this point onwards once successful.
    await Promise.all([
      setMatchStatus(waitingUser.message.userId, waitingUser.message.sessionId, MatchingStatusEnum.MATCHED),
      setMatchStatus(message.userId, message.sessionId, MatchingStatusEnum.MATCHED),
    ]);
    clearTimeout(waitingUser.timer);

    console.log(
      `${new Date().toISOString()} MessageService: Matched users (${processorName}) in ${message.category}: ${waitingUser.message.userId} and ${message.userId}`,
    );

    await MessageSource.sendMatchedPlayersMessage([waitingUser.message, message]);
  }

  function setWaitingUser(message, validWindow, elapsed, processorName) {
    const waitingUser = { message, timer: null };
    const remainingTime = validWindow - elapsed;

    console.log(`${new Date().toISOString()} MessageService: Setting waiting user ${message.userId}`);
    waitingUser.timer = setTimeout(async () => {
      console.log(
        `${new Date().toISOString()} MessageService: Waiting user ${message.userId} in ${processorName} ${message.category} queue timed out.`,
      );
      clearWaitingUser();

      // If the processor is 'main', republish to a dead-letter queue only if not cancelled.
      if (processorName === 'main') {
        if (await isUserCancelled(message.userId)) {
          console.log(
            `${new Date().toISOString()} MessageService: User ${message.userId} cancelled during timeout, skipping further processing.`,
          );
          return;
        }
        await MessageSource.sendCategoryMessage(message);
        return;
      }
      await setMatchStatus(message.userId, message.sessionId, MatchingStatusEnum.NO_MATCH);
    }, remainingTime);

    console.log(
      `${new Date().toISOString()} MessageService: Stored waiting user (${processorName}) in ${message.category}: ${message.userId}`,
    );

    return waitingUser;
  }

  function clearWaitingUser() {
    waitingUser = null;
  }

  return async function process(message) {
    // Check if the category + complexity or category still exists.
    // If it doesn't then it means a question delete occurred and, we should not process
    // anymore messages for this queue and just set everyone's matching status to NO_MATCH.
    if (!(await shouldProcessMessage(message))) {
      console.log(
        `${new Date().toISOString()} MessageService: Queue does not exists. Should not process ${message.userId}`,
      );
      await setMatchStatus(message.userId, message.sessionId, MatchingStatusEnum.NO_MATCH);
      return;
    }

    const currentTime = Date.now();
    const elapsed = currentTime - message.enqueueTime;

    // If waiting user doesn't exist, set current user as waiting user.
    if (!waitingUser) {
      waitingUser = setWaitingUser(message, validWindow, elapsed, processorName);
      return;
    }

    // Attempt to match waiting user with the current message.
    // Scenario 1: Both users cancelled when attempt matching
    // Scenario 2: Only waiting user cancelled when attempt matching
    // Scenario 3: Only current user cancelled when attempt matching
    const [waitingUserCancelled, currentUserCancelled] = await Promise.all([
      isUserCancelled(waitingUser.message.userId, waitingUser.message.sessionId),
      isUserCancelled(message.userId, message.sessionId),
    ]);

    if (!waitingUserCancelled && !currentUserCancelled) {
      await attemptMatching(waitingUser, message, processorName);
      clearWaitingUser();
      return;
    }

    console.log(`${new Date().toISOString()} MessageService: Attempt to match failed. Someone has cancelled.`);

    // Waiting user has cancelled, clear waiting user
    if (waitingUserCancelled) {
      clearTimeout(waitingUser.timer);
      console.log(
        `${new Date().toISOString()} MessageService: Waiting user ${waitingUser.message.userId} has CANCELLED, clearing waiting slot.`,
      );
      clearWaitingUser();
    }

    // If current user not cancelled, set user to be the new waiting user.
    if (!currentUserCancelled) {
      waitingUser = setWaitingUser(message, validWindow, elapsed, processorName);
      return;
    }

    console.log(
      `${new Date().toISOString()} MessageService: Current message user ${message.userId} is CANCELLED, skipping processing.`,
    );
  };
}

// Isolate the instances so each consumer will have their own waitingUser, so they don't end up sharing.
function createNormalProcessor() {
  return createMessageProcessor(MessageConfig.QUEUE_TIMEOUT * 1000, 'main');
}

function createDeadLetterProcessor() {
  return createMessageProcessor(MessageConfig.DEAD_LETTER_QUEUE_TIMEOUT * 1000, 'dead-letter');
}

export default {
  createNormalProcessor,
  createDeadLetterProcessor,
};
