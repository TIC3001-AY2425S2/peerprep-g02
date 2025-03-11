// In-memory waiting user for matching (for simplicity).
let waitingUser = null;

/**
 * Processes a message from the main queue.
 * If a waiting user is present and still valid, the two are matched.
 * Otherwise, the current message is stored as waiting.
 *
 * @param {Object} message - The message payload.
 */
export async function processMessage(message) {
  // TODO: Remove queue hardset timeout
  const currentTime = Date.now();
  const elapsed = currentTime - message.enqueueTime;
  if (elapsed > 25000) {
    console.log(`MessageService: Message for person ${message.personId} timed out (main queue).`);
    return;
  }
  if (!waitingUser) {
    waitingUser = message;
    console.log(`MessageService: Stored waiting user (main queue): ${message.personId}`);
  } else {
    const waitingElapsed = currentTime - waitingUser.enqueueTime;
    if (waitingElapsed <= 25000) {
      console.log(`MessageService: Matched users (main queue): ${waitingUser.personId} and ${message.personId}`);
      // Implement your match logic here.
      waitingUser = null;
    } else {
      console.log(`MessageService: Waiting user ${waitingUser.personId} expired. Replacing with ${message.personId}`);
      waitingUser = message;
    }
  }
}

/**
 * Processes a message from the dead-letter queue.
 * Uses a shorter (5-second) window for matching.
 *
 * @param {Object} message - The message payload.
 */
export async function processDeadLetterMessage(message) {
  // TODO: Remove deadletter queue hardset timeout
  const currentTime = Date.now();
  const elapsed = currentTime - message.enqueueTime;
  if (elapsed > 5000) {
    console.log(`MessageService: Message for person ${message.personId} timed out (deadletter). Discarding.`);
    return;
  }
  if (!waitingUser) {
    waitingUser = message;
    console.log(`MessageService: Stored waiting user (deadletter): ${message.personId}`);
  } else {
    const waitingElapsed = currentTime - waitingUser.enqueueTime;
    if (waitingElapsed <= 5000) {
      console.log(`MessageService: Matched users (deadletter): ${waitingUser.personId} and ${message.personId}`);
      // Implement your match logic here.
      waitingUser = null;
    } else {
      console.log(
        `MessageService: Waiting user ${waitingUser.personId} expired (deadletter). Replacing with ${message.personId}`,
      );
      waitingUser = message;
    }
  }
}

export default {
  processMessage,
  processDeadLetterMessage,
};
