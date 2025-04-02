import RedisLock from '../repository/redis-lock.js';
import { isCategoryActive } from '../repository/redis-repository.js';
import MessageConfig from './MessageConfig.js';
import MessageService from './MessageService.js';
import MessageSource from './MessageSource.js';
import QuestionServiceApiProvider from './QuestionServiceApiProvider.js';

/**
 * Creates a queue for a specific category/complexity queue.
 * Also creates a consumer to process messages.
 */
async function startQueueConsumer(category, complexity) {
  const queueName = MessageConfig.getQueueName(category, complexity);

  const channel = await MessageConfig.getChannel();
  await channel.assertQueue(queueName, MessageConfig.getQueueConfiguration(category));
  const processor = MessageService.createNormalProcessor();

  channel.consume(
    queueName,
    async (message) => {
      if (message) {
        const messageContent = JSON.parse(message.content.toString());

        // Based on the entire question delete flow, we can be sure that once this flag is received
        // it is always the last and final message in this queue. In the unlikely event
        // that it is not due to CPU lag issues or whatever there is little value to account for this edge case.
        // i.e. question delete triggered but someone matches and their request bypasses the redis
        // category + complexity check and due to CPU issues, matching service sends the matching
        // message slower than our isShutdown kill signal message. In any case there is another check at
        // MessageService.shouldProcessMessage().
        if (messageContent.isShutdown === true) {
          console.log(`${new Date().toISOString()} MessageSink: Shutdown kill signal received on ${queueName}.`);
          channel.deleteQueue(queueName);
          console.log(`${new Date().toISOString()} MessageSink: Queue ${queueName} deleted successfully.`);
          return;
        }

        console.log(
          `${new Date().toISOString()} MessageSink: Received message for user ${messageContent.userId} on queue ${queueName}`,
        );
        await processor(messageContent);
      }
      // No ack since we don't really want to requeue the message.
    },
    { noAck: true },
  );

  console.log(`${new Date().toISOString()} MessageSink: Listening on queue ${queueName}`);
}

/**
 * Starts a consumer for the dead-letter queue for a given category.
 * Also creates a consumer to process dead-letter messages.
 */
async function startDeadLetterConsumer(category) {
  const channel = await MessageConfig.getChannel();

  const deadLetterQueueName = MessageConfig.getQueueName(category);
  await channel.assertQueue(deadLetterQueueName, MessageConfig.getDeadLetterQueueConfiguration());

  const processor = MessageService.createDeadLetterProcessor();

  channel.consume(
    deadLetterQueueName,
    async (message) => {
      if (message) {
        const messageContent = JSON.parse(message.content.toString());
        if (messageContent.isShutdown === true) {
          console.log(
            `${new Date().toISOString()} MessageSink: Shutdown kill signal received on ${deadLetterQueueName}.`,
          );
          channel.deleteQueue(deadLetterQueueName);
          console.log(`${new Date().toISOString()} MessageSink: Queue ${deadLetterQueueName} deleted successfully.`);
          return;
        }

        console.log(
          `${new Date().toISOString()} MessageSink (DeadLetter): Received message for user ${messageContent.userId}`,
        );
        await processor(messageContent);
      }
    },
    { noAck: true },
  );

  console.log(
    `${new Date().toISOString()} MessageSink: Dead-letter consumer listening on queue ${deadLetterQueueName}`,
  );
}

/**
 * Creates and starts a consumer for queue create/delete events during question create/delete flow.
 * This queue-updates queue is declared exclusive and only 1 consumer can receive messages for it.
 * So when scaling up, we want to ensure that the other containers instantiate a consumer for it.
 */
export async function startQueueUpdatesConsumer() {
  const queueName = MessageConfig.UPDATES_QUEUE_NAME;
  const channel = await MessageConfig.getChannel();

  // Only initialize queue updates consumer if this application instance is the leader/has the lock.
  await RedisLock.ensureLeadership(async () => {
    await channel.assertQueue(queueName, MessageConfig.getQueueUpdatesConfiguration());

    channel.consume(
      queueName,
      async (message) => {
        if (message) {
          const messageContent = JSON.parse(message.content.toString());
          console.log(
            `${new Date().toISOString()} MessageSink: Received message ${JSON.stringify(messageContent)} on queue ${queueName}`,
          );
          const operations = [];
          switch (messageContent.type) {
            case 'create':
              operations.push(MessageSource.sendCreateEvent(messageContent.category, messageContent.complexity));
              break;
            case 'delete':
              // We only need to check if the category exists since the question service already determined we must delete
              // these queues. Question service also removes the entry from redis, so we can just check with redis.
              const filteredCategoryPromises = messageContent.category.map(async (cat) => {
                const exists = await isCategoryActive(cat);
                return exists ? null : cat;
              });

              const filteredCategory = (await Promise.all(filteredCategoryPromises)).filter(Boolean);

              messageContent.category.forEach((cat) => {
                operations.push(MessageSource.sendKillSignal(cat, messageContent.complexity));
              });

              filteredCategory.forEach((cat) => {
                operations.push(MessageSource.sendKillSignal(cat));
              });
              break;
          }

          await Promise.all(operations);
        }
      },
      { noAck: true },
    );

    console.log(`${new Date().toISOString()} MessageSink: Queue updates listening on queue ${queueName}`);
  });
}

/**
 * Creates and starts a fanout exchange consumer for queue create event processing
 * since we have to initialize a consumer on all containers. A fanout sends a message
 * to all consumers registered to it. So 3 containers would mean 3 messages sent by the
 * fanout exchange.
 */
async function startCreateEventConsumer() {
  const channel = await MessageConfig.getChannel();
  await channel.assertExchange(MessageConfig.FANOUT_EXCHANGE, 'fanout', { durable: true });

  // Since using a fanout, create queue with a generated queue name so each container has their own.
  // The fanout exchange will then send messages to all queues binded to it.
  const queueName = MessageConfig.generateShortQueueName();
  await channel.assertQueue(queueName, { exclusive: true, autoDelete: true });
  await channel.bindQueue(queueName, MessageConfig.FANOUT_EXCHANGE, '');

  channel.consume(queueName, async (msg) => {
    if (msg) {
      try {
        const messageContent = JSON.parse(msg.content.toString());
        console.log(
          `${new Date().toISOString()} MessageSink: Received create event: ${JSON.stringify(messageContent)} on queue ${queueName}`,
        );

        // Start category + complexity consumer.
        const queueConsumers = messageContent.categoryComplexityQueues.map((cat) =>
          startQueueConsumer(cat, messageContent.complexity),
        );

        // Start the dead-letter consumer for each category in categoryQueues, if any.
        const deadLetterConsumers =
          messageContent.categoryQueues.length > 0
            ? messageContent.categoryQueues.map((cat) => startDeadLetterConsumer(cat))
            : [];

        await Promise.all([...queueConsumers, ...deadLetterConsumers]);

        console.log(`${new Date().toISOString()} MessageSink: Finished creating new queues in ${queueName}`);
        channel.ack(msg);
      } catch (err) {
        console.error(`${new Date().toISOString()} MessageSink: Error processing create event:`, err);
        channel.nack(msg);
      }
    }
  });

  console.log(`${new Date().toISOString()} MessageSink: Create event consumer is listening on queue ${queueName}`);
}

/**
 * Starts all consumers for the defined categories and complexities.
 * For each category, it creates a consumer for every complexity and also starts the dead-letter consumer.
 */
async function startAllConsumers() {
  const categoryComplexityList = await QuestionServiceApiProvider.getAllCategoriesAndComplexitiesCombination();

  const consumerPromises = categoryComplexityList.flatMap(({ category, complexities }) => [
    ...complexities.map((complexity) => startQueueConsumer(category, complexity)),
    startDeadLetterConsumer(category),
  ]);

  consumerPromises.push(startQueueUpdatesConsumer());
  consumerPromises.push(startCreateEventConsumer());

  await Promise.all(consumerPromises);
  console.log(`${new Date().toISOString()} MessageSink: All consumers have been started.`);
}

export default { startAllConsumers };
