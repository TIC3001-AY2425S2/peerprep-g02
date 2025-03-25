import MessageConfig from './MessageConfig.js';

/**
 * Publishes a message to the appropriate category-complexity queue.
 */
async function sendCategoryComplexityMessage({ userId, category, complexity, enqueueTime }) {
  const queueName = MessageConfig.getQueueName(category, complexity);

  const channel = await MessageConfig.getChannel();
  await channel.assertQueue(queueName, MessageConfig.getQueueConfiguration(category));

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
export async function sendCategoryMessage(message) {
  const channel = await MessageConfig.getChannel();
  message.enqueueTime = Date.now();
  channel.publish(
    MessageConfig.EXCHANGE,
    message.category,
    Buffer.from(JSON.stringify(message))
  );
  console.log(`${new Date().toISOString()} MessageSource: Sent message for user ${message.userId} in queue ${message.category}`);
  return true;
}

/**
 * Used to process players who are matched together.
 * Publishes a matched players message to the matched players queue.
 */
export async function sendMatchedPlayersMessage(players) {
  const channel = await MessageConfig.getChannel();
  const matchedPlayersMessage = { players };
  channel.publish(
    MessageConfig.EXCHANGE,
    MessageConfig.MATCHED_PLAYERS_QUEUE_NAME,
    Buffer.from(JSON.stringify(matchedPlayersMessage))
  );
  console.log(`${new Date().toISOString()} MessageSource: Sent matched players message for players ${players.map(p => p.userId).join(', ')}`);
  return true;
}

export default { sendCategoryComplexityMessage, sendCategoryMessage, sendMatchedPlayersMessage };
