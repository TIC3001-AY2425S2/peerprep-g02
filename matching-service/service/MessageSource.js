import MessageConfig from './MessageConfig.js';

/**
 * Publishes a message to the appropriate category-complexity queue.
 */
async function sendCategoryComplexityMessage({ userId, category, complexity, enqueueTime }) {
  const queueName = MessageConfig.getQueueName(category, complexity);
  const channel = await MessageConfig.getChannel();

  const message = { userId, category, complexity, enqueueTime };
  const messageBuffer = Buffer.from(JSON.stringify(message));
  channel.publish(MessageConfig.EXCHANGE, queueName, messageBuffer);

  console.log(`${new Date().toISOString()} MessageSource: Sent message for user ${userId} to queue ${queueName}`);
  return true;
}

/**
 * Used as dead-letter queue for category-complexity queue.
 * Sends a message by updating its enqueueTime and publishing to its category queue.
 */
async function sendCategoryMessage(message) {
  const queueName = message.category;
  const channel = await MessageConfig.getChannel();
  message.enqueueTime = Date.now();
  channel.publish(MessageConfig.EXCHANGE, queueName, Buffer.from(JSON.stringify(message)));
  console.log(
    `${new Date().toISOString()} MessageSource: Sent message for user ${message.userId} in queue ${queueName}`,
  );
  return true;
}

/**
 * Used to process players who are matched together.
 * Publishes a matched players message to the matched players queue.
 */
async function sendMatchedPlayersMessage(players) {
  const channel = await MessageConfig.getChannel();
  const matchedPlayersMessage = { players };
  channel.publish(
    MessageConfig.EXCHANGE,
    MessageConfig.MATCHED_PLAYERS_QUEUE_NAME,
    Buffer.from(JSON.stringify(matchedPlayersMessage)),
  );
  console.log(
    `${new Date().toISOString()} MessageSource: Sent matched players message for players ${players.map((p) => p.userId).join(', ')}`,
  );
  return true;
}

async function sendKillSignal(category, complexity) {
  const queueName = MessageConfig.getQueueName(category, complexity);
  const channel = await MessageConfig.getChannel();
  const message = { isShutdown: true };

  return new Promise((resolve, reject) => {
    // In fanout exchange the ACK doesn't actually refer to consumers sending an ACK but rather whether
    // the message was delivered.
    channel.publish(MessageConfig.FANOUT_EXCHANGE, queueName, Buffer.from(JSON.stringify(message)), async (err, ok) => {
      if (err) {
        console.error(`${new Date().toISOString()} - Error publishing kill signal: `, err);
        return reject(new Error('Kill signal message was nacked'));
      }
      console.log(`${new Date().toISOString()} - Kill signal successfully published to ${queueName}`);
      try {
        // Immediately delete the queue once the kill signal has been acknowledged.
        await channel.deleteQueue(queueName);
        console.log(`${new Date().toISOString()} - Queue ${queueName} deleted successfully.`);
        resolve(ok);
      } catch (deleteErr) {
        console.error(`${new Date().toISOString()} - Error deleting queue ${queueName}:`, deleteErr);
        reject(deleteErr);
      }
    });
  });
}

export default { sendCategoryComplexityMessage, sendCategoryMessage, sendMatchedPlayersMessage, sendKillSignal };
