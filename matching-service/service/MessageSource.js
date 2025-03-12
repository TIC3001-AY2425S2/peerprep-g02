import MessageConfig from './MessageConfig.js';

/**
 * Publishes a message to the appropriate category-complexity queue.
 */
async function sendMessage({ userId, category, complexity, enqueueTime }) {
  const queueName = MessageConfig.getQueueName(category, complexity);

  const channel = await MessageConfig.getChannel();
  await channel.assertQueue(queueName, MessageConfig.getQueueConfiguration(category));

  const message = { userId, category, complexity, enqueueTime };
  const messageBuffer = Buffer.from(JSON.stringify(message));
  channel.publish(MessageConfig.EXCHANGE, queueName, messageBuffer);

  console.log(`${new Date().toISOString()} MessageSource: Sent message for user ${userId} to queue ${queueName}`);
  return true;
}

export default { sendMessage };
