import MessageConfig from './MessageConfig.js';
import MessageService from './MessageService.js';
import QuestionServiceApiProvider from './QuestionServiceApiProvider.js';
import redisClient from '../repository/redis.js';

const DISTINCT_CATEGORY_COMPLEXITY_KEY = 'category_complexity_set';
const REDIS_QUEUE_CREATION_INTERVAL = 10;

/**
 * Creates a queue for a specific category/complexity queue.
 * Also creates a consumer to process messages.
 */
async function startQueueConsumer(category, complexity) {
  const queueName = MessageConfig.getQueueName(category, complexity);

  const channel = await MessageConfig.getChannel();
  await channel.assertQueue(queueName, MessageConfig.getQueueConfiguration(category));

  const processor = MessageService.createNormalProcessor();

  channel.consume(queueName, async (message) => {
    if (message) {
      const messageContent = JSON.parse(message.content.toString());
      console.log(
        `${new Date().toISOString()} MessageSink: Received message for user ${messageContent.userId} on queue ${queueName}`,
      );
      await processor(messageContent);
      channel.ack(message);
    }
  });

  console.log(`${new Date().toISOString()} MessageSink: Listening on queue ${queueName}`);
}

/**
 * Starts a consumer for the dead-letter queue for a given category.
 * Also creates a consumer to process dead-letter messages.
 */
async function startDeadLetterConsumer(category) {
  const channel = await MessageConfig.getChannel();

  const deadLetterQueue = MessageConfig.getQueueName(category);
  await channel.assertQueue(deadLetterQueue, MessageConfig.getDeadLetterQueueConfiguration());

  const processor = MessageService.createDeadLetterProcessor();

  channel.consume(deadLetterQueue, async (message) => {
    if (message) {
      const messageContent = JSON.parse(message.content.toString());
      console.log(
        `${new Date().toISOString()} MessageSink (DeadLetter): Received message for user ${messageContent.userId}`,
      );
      await processor(messageContent);
      channel.ack(message);
    }
  });

  console.log(`${new Date().toISOString()} MessageSink: Dead-letter consumer listening on queue ${deadLetterQueue}`);
}

/**
 * Starts a consumer for the matched players processing.
 * We want to leave the consumers to only be responsible for matching
 * and leave the processing to another dedicated consumer.
 */
async function startMatchedPlayersConsumer() {
  const channel = await MessageConfig.getChannel();

  const queue = MessageConfig.MATCHED_PLAYERS_QUEUE_NAME;
  await channel.assertQueue(queue, MessageConfig.getMatchedPlayersQueueConfiguration());

  channel.consume(queue, async (message) => {
    if (message) {
      const messageContent = JSON.parse(message.content.toString());

      const userIds = messageContent.players.map((player) => player.userId).join(', ');
      console.log(`${new Date().toISOString()} MessageSink (Matched players): Received message for users ${userIds}`);

      await MessageService.processMatchedPlayers(messageContent);
      channel.ack(message);
    }
  });

  console.log(`${new Date().toISOString()} MessageSink: Matched players consumer listening on queue ${queue}`);
}

/**
 * Starts all consumers for the defined categories and complexities.
 * For each category, it creates a consumer for every complexity and also starts the dead-letter consumer.
 */
async function startAllConsumers() {
  const categoryComplexityList = await QuestionServiceApiProvider.getAllCategoriesAndComplexitiesCombination();

  const consumerPromises = categoryComplexityList.flatMap(({ category, complexity: complexities }) => [
    ...complexities.map((complexity) => startQueueConsumer(category, complexity)),
    startDeadLetterConsumer(category),
  ]);

  consumerPromises.push(startMatchedPlayersConsumer());

  await Promise.all(consumerPromises);
  console.log(`${new Date().toISOString()} MessageSink: All consumers have been started.`);
}

async function startConsumersFromRedis() {
  // Retrieve all unique category:complexity set entries from Redis
  const members = await redisClient.sMembers(DISTINCT_CATEGORY_COMPLEXITY_KEY);

  // We can attempt to create queues even if it exists since rabbitmq queues are idempotent.
  const consumerPromises = members.flatMap(member => {
    const [category, complexity] = member.split(':');
    return [
      startQueueConsumer(category, complexity),
      startDeadLetterConsumer(category)
    ];
  });

  consumerPromises.push(startMatchedPlayersConsumer());

  await Promise.all(consumerPromises);
  console.log('Consumers started from Redis.');
}

export function scheduleConsumerQueueFromRedis() {
  // Run once then every 10 seconds
  startConsumersFromRedis();
  setInterval(startConsumersFromRedis, REDIS_QUEUE_CREATION_INTERVAL * 1000);
}

export default { startAllConsumers, scheduleConsumerQueueFromRedis };
