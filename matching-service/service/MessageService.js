import MessageConfig from './MessageConfig.js';

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
    } else {
      // Clear the timer for the waiting user to avoid race conditions.
      clearTimeout(waitingUser.timer);
      console.log(
        `${new Date().toISOString()} MessageService: Matched users (${processorName}) in ${message.category}: ${waitingUser.message.userId} and ${message.userId}`,
      );
      // TODO: Do actual matching here (send something to collaboration service).
      waitingUser = null;
    }
  };
}

// Isolate the instances so each consumer will have their own waitingUser, so they don't end up sharing.
export function createNormalProcessor() {
  return createMessageProcessor(MessageConfig.QUEUE_TIMEOUT * 1000, 'main');
}

export function createDeadLetterProcessor() {
  return createMessageProcessor(MessageConfig.DEAD_LETTER_QUEUE_TIMEOUT * 1000, 'dead-letter');
}

export default {
  createNormalProcessor,
  createDeadLetterProcessor,
};
