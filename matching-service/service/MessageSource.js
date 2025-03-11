import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_DOCKER_URI || 'amqp://localhost';

let connection = null;
let channel = null;

/**
 * Reuses an existing channel or creates a new one if none exists.
 */
async function getChannel() {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
  }
  return channel;
}

/**
 * sendUser publishes a user message to the appropriate category/complexity queue.
 * The exchange and queue are asserted as non‑durable. A fixed TTL (25 sec) is set at the queue level.
 * @param {string} userId - Unique user ID.
 * @param {string} category - Category name (used as exchange name).
 * @param {string} complexity - Complexity (routing key).
 * @param {number} enqueueTime - Timestamp when the message is enqueued.
 * @returns {Promise<boolean>}
 */
async function sendMessage({ userId, category, complexity, enqueueTime }) {
  const channel = await getChannel();
  await channel.assertExchange(category, 'direct', { durable: true });

  const queueName = `${category}_${complexity}_queue`;

  await channel.assertQueue(queueName, {
    durable: true,
    messageTtl: 25000,
    deadLetterExchange: `deadletter_${category}`,
  });
  await channel.bindQueue(queueName, category, complexity);

  // Prepare and publish the message.
  const message = { userId, category, complexity, enqueueTime };
  const messageBuffer = Buffer.from(JSON.stringify(message));
  channel.publish(category, complexity, messageBuffer, { correlationId: userId });

  console.log(`MessageSource: Sent message for user ${userId} to queue ${queueName}`);
  return true;
}

export default { sendMessage };
