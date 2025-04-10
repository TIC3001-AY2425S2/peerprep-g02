import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import {
  atomicMatch,
  getMatchStatus,
  isCategoryComplexityActive,
  setMatchStatus,
} from '../repository/redis-repository.js';
import MessageConfig from './MessageConfig.js';
import MessageSource from './MessageSource.js';

/**
 * Creates a message processor. Each processor will have its own waiting state.
 */
function createMessageProcessor() {
  let waitingUser = null;

  // Use a delay factor so that we can favor the user's original complexity choice.
  function computeMatchDelay(waitingDistance, incomingDistance) {
    // Use the maximum distance as the delay factor.
    return 100 * Math.max(waitingDistance, incomingDistance);
  }

  async function shouldProcessMessage(message) {
    const { category, complexity } = message;
    return await isCategoryComplexityActive(category, complexity);
  }

  async function isUserWaiting(userId, sessionId) {
    return (await getMatchStatus(userId, sessionId)) === MatchingStatusEnum.WAITING;
  }

  async function attemptMatching(waitingUser, message) {
    const delay = computeMatchDelay(waitingUser.message.expansion, message.expansion);
    console.log(`${new Date().toISOString()} MessageService: Delaying for ${delay}ms to account for better match.`);
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Update both users to MATCHED and frontend should not allow users to cancel at this point onwards once successful.
    if (
      !(await atomicMatch(waitingUser.message.userId, waitingUser.message.sessionId, message.userId, message.sessionId))
    ) {
      return false;
    }
    clearTimeout(waitingUser.timer);

    console.log(
      `${new Date().toISOString()} MessageService: Matched users in ${message.category} ${message.complexity}: ${waitingUser.message.userId} and ${message.userId}`,
    );

    await MessageSource.sendMatchedPlayersMessage([waitingUser.message, message]);
    return true;
  }

  function setWaitingUser(message, elapsed) {
    const waitingUser = { message, timer: null };
    const remainingTime = MessageConfig.QUEUE_TIMEOUT * 1000 - elapsed;

    console.log(`${new Date().toISOString()} MessageService: Setting waiting user ${message.userId}`);
    waitingUser.timer = setTimeout(async () => {
      console.log(
        `${new Date().toISOString()} MessageService: Waiting user ${message.userId} in ${message.category} ${message.complexity} queue timed out.`,
      );
      clearWaitingUser();

      await setMatchStatus(message.userId, message.sessionId, MatchingStatusEnum.NO_MATCH);
    }, remainingTime);

    console.log(
      `${new Date().toISOString()} MessageService: Stored waiting user in ${message.category} ${message.complexity}: ${message.userId}`,
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
      waitingUser = setWaitingUser(message, elapsed);
      return;
    }

    // Attempt to match waiting user with the current message.
    // Scenario 1: Both users not waiting when attempt matching
    // Scenario 2: Only waiting user waiting when attempt matching
    // Scenario 3: Only current user waiting when attempt matching
    const [waitingUserWaiting, currentUserWaiting] = await Promise.all([
      isUserWaiting(waitingUser.message.userId, waitingUser.message.sessionId),
      isUserWaiting(message.userId, message.sessionId),
    ]);

    if (waitingUserWaiting && currentUserWaiting && (await attemptMatching(waitingUser, message))) {
      clearWaitingUser();
      return;
    }

    console.log(`${new Date().toISOString()} MessageService: Attempt to match failed. Someone has cancelled.`);

    // Waiting user not waiting, clear waiting user
    if (!waitingUserWaiting) {
      clearTimeout(waitingUser.timer);
      console.log(
        `${new Date().toISOString()} MessageService: Waiting user ${waitingUser.message.userId} has CANCELLED, clearing waiting slot.`,
      );
      clearWaitingUser();
    }

    // If current user waiting, set user to be the new waiting user.
    if (currentUserWaiting) {
      waitingUser = setWaitingUser(message, elapsed);
      return;
    }

    console.log(
      `${new Date().toISOString()} MessageService: Current message user ${message.userId} is CANCELLED, skipping processing.`,
    );
  };
}

// Isolate the instances so each consumer will have their own waitingUser, so they don't end up sharing.
function createNormalProcessor() {
  return createMessageProcessor();
}

export default {
  createNormalProcessor,
};
