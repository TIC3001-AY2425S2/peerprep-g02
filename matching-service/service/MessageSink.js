import amqp from 'amqplib';
import MessageService from './MessageService.js';
import QuestionServiceApiProvider from './QuestionServiceApiProvider.js';

const RABBITMQ_URL = process.env.RABBITMQ_DOCKER_URI || 'amqp://localhost';

/**
 * Creates a consumer for a specific category/complexity queue.
 * The consumer asserts the non‑durable direct exchange and queue (with a fixed TTL),
 * binds them, and then consumes messages—passing each to QueueService.processMessage().
 *
 * @param {string} category - Category name (also used as exchange name).
 * @param {string} complexity - Complexity (used as the routing key).
 */
export async function startQueueConsumer(category, complexity) {
  const queueName = `${category}_${complexity}_queue`;
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(category, 'direct', { durable: true });
  await channel.assertQueue(queueName, {
    durable: true,
    messageTtl: 25000,
    deadLetterExchange: `deadletter_${category}`,
  });
  // Bind the queue to the exchange using the complexity as the routing key.
  await channel.bindQueue(queueName, category, complexity);

  // Consume messages from the queue.
  channel.consume(queueName, async (msg) => {
    if (msg) {
      const messageContent = JSON.parse(msg.content.toString());
      console.log(`MessageSink: Received message for user ${messageContent.userId} on queue ${queueName}`);
      await MessageService.processMessage(messageContent);
      channel.ack(msg);
    }
  });

  console.log(`MessageSink: Listening on queue ${queueName}`);
}

/**
 * Starts a consumer for the dead-letter queue for a given category.
 * The dead-letter queue is asserted as non‑durable with a fixed TTL of 5 seconds.
 *
 * @param {string} category - The deadletter queue name.
 */
export async function startDeadLetterConsumer(category) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  const deadLetterExchange = `deadletter_${category}`;
  await channel.assertExchange(deadLetterExchange, 'direct', { durable: true });

  const deadLetterQueue = `${category}_deadletter_queue`;
  await channel.assertQueue(deadLetterQueue, {
    durable: true,
    messageTtl: 5000,
  });
  await channel.bindQueue(deadLetterQueue, deadLetterExchange, '');

  channel.consume(deadLetterQueue, async (msg) => {
    if (msg) {
      const messageContent = JSON.parse(msg.content.toString());
      console.log(`MessageSink (DeadLetter): Received message for user ${messageContent.personId}`);
      await MessageService.processDeadLetterMessage(messageContent);
      channel.ack(msg);
    }
  });

  console.log(`MessageSink: Dead-letter consumer listening on queue ${deadLetterQueue}`);
}

/**
 * Starts all consumers for the defined categories and complexities.
 * For each category, it creates a consumer for every complexity and also starts the dead-letter consumer.
 */
export async function startAllConsumers() {
  const [categories, complexities] = await Promise.all([
    QuestionServiceApiProvider.getAllCategories(),
    QuestionServiceApiProvider.getAllComplexities(),
  ]);

  const consumerPromises = [];

  for (const category of categories) {
    for (const complexity of complexities) {
      consumerPromises.push(startQueueConsumer(category, complexity));
    }
    consumerPromises.push(startDeadLetterConsumer(category));
  }
  await Promise.all(consumerPromises);
  console.log('MessageSink: All consumers have been started.');
}

export default { startAllConsumers };
