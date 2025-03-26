import { isCategoryActive } from '../repository/redis-repository.js';
import MessageConfig from './MessageConfig.js';
import MessageService from './MessageService.js';
import MessageSource from './MessageSource.js';
import QuestionServiceApiProvider from './QuestionServiceApiProvider.js';

// The current queues are in a direct exchange so that means that when we scale horizontally
// and a message comes in, a message is only processed by 1 consumer even though there may be
// multiple instances of the application/container (i.e. multiple consumers for the same queue).
// In this case, the kill signal sent during the delete question flow won't work since the
// message is only received by 1 application/container.
// We can solve this issue by further placing these queues in a fanout exchange which sends
// a message to ALL queues under this exchange. A queue can subscribe to multiple exchanges.
// This way, the isShutdown kill signal can be sent to all instances of the application/containers.
async function bindQueueToFanout(channel, queueName) {
  await channel.assertExchange(MessageConfig.FANOUT_EXCHANGE, 'fanout', { durable: true });
  await channel.bindQueue(queueName, MessageConfig.FANOUT_EXCHANGE, '');
}

/**
 * Creates a queue for a specific category/complexity queue.
 * Also creates a consumer to process messages.
 */
async function startQueueConsumer(category, complexity) {
  const queueName = MessageConfig.getQueueName(category, complexity);

  const channel = await MessageConfig.getChannel();
  await channel.assertQueue(queueName, MessageConfig.getQueueConfiguration(category));
  await bindQueueToFanout(channel, queueName);
  const processor = MessageService.createNormalProcessor();

  const { consumerTag } = channel.consume(queueName, async (message) => {
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
        console.log(`${new Date().toISOString()} - Shutdown kill signal received on ${queueName}.`);
        channel.ack(message);
        // Stops further delivery of messages.
        await channel.cancel(consumerTag);
        return;
      }

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

  const deadLetterQueueName = MessageConfig.getQueueName(category);
  await channel.assertQueue(deadLetterQueueName, MessageConfig.getDeadLetterQueueConfiguration());
  await bindQueueToFanout(channel, deadLetterQueueName);

  const processor = MessageService.createDeadLetterProcessor();

  channel.consume(deadLetterQueueName, async (message) => {
    if (message) {
      const messageContent = JSON.parse(message.content.toString());
      if (messageContent.isShutdown === true) {
        console.log(`${new Date().toISOString()} - Shutdown kill signal received on ${queueName}.`);
        channel.ack(message);
        return;
      }

      console.log(
        `${new Date().toISOString()} MessageSink (DeadLetter): Received message for user ${messageContent.userId}`,
      );
      await processor(messageContent);
      channel.ack(message);
    }
  });

  console.log(
    `${new Date().toISOString()} MessageSink: Dead-letter consumer listening on queue ${deadLetterQueueName}`,
  );
}

/**
 * Starts a consumer for the matched players processing.
 * We want to leave the consumers to only be responsible for matching
 * and leave the processing to another dedicated consumer.
 */
async function startMatchedPlayersConsumer() {
  const channel = await MessageConfig.getChannel();

  const queueName = MessageConfig.MATCHED_PLAYERS_QUEUE_NAME;
  await channel.assertQueue(queueName, MessageConfig.getMatchedPlayersQueueConfiguration());

  channel.consume(queueName, async (message) => {
    if (message) {
      const messageContent = JSON.parse(message.content.toString());

      const userIds = messageContent.players.map((player) => player.userId).join(', ');
      console.log(`${new Date().toISOString()} MessageSink (Matched players): Received message for users ${userIds}`);

      await MessageService.processMatchedPlayers(messageContent);
      channel.ack(message);
    }
  });

  console.log(`${new Date().toISOString()} MessageSink: Matched players consumer listening on queue ${queueName}`);
}

/**
 * Creates and starts a consumer for queue create/delete events during question create/delete flow.
 */
async function startQueueUpdatesConsumer() {
  const queueName = MessageConfig.UPDATES_QUEUE_NAME;
  const channel = await MessageConfig.getChannel();

  // This queue-updates queue is declared exclusive and only 1 consumer can receive messages for it.
  // So when scaling up, we want to ensure that the other containers do not crash while trying
  // to get access. This is not the perfect way to do it since if the container with the access
  // rights to this queue crashes, no one else can take over but... whatever.
  // For some reason we need to catch the error on the channel level and also on the assertQueue.
  // The error being that we're trying to create a consumer for an exclusive queue that already
  // has a consumer.
  channel.on('error', (error) => {
    if (error.message.includes('RESOURCE_LOCKED')) {
      console.error(
        `${new Date().toISOString()} - RESOURCE_LOCKED - Queue already in use by another consumer: ${queueName}`,
      );
      // Optionally, set a flag or take other action here.
    } else {
      console.error(`${new Date().toISOString()} - Channel error:`, error);
    }
  });

  let isAbleGetAccess = true;

  await channel.assertQueue(queueName, MessageConfig.getQueueUpdatesConfiguration()).catch((error) => {
    if (error.message.includes('RESOURCE_LOCKED')) {
      isAbleGetAccess = false;
      return;
    }
    throw error;
  });

  if (!isAbleGetAccess) {
    return;
  }

  channel.consume(queueName, async (message) => {
    if (message) {
      try {
        const messageContent = JSON.parse(message.content.toString());
        console.log(
          `${new Date().toISOString()} MessageSink: Received message ${JSON.stringify(messageContent)} on queue ${queueName}`,
        );
        const operations = [];

        switch (messageContent.type) {
          case 'create':
            operations.push(startQueueConsumer(messageContent.category, messageContent.complexity));
            break;
          case 'delete':
            operations.push(MessageSource.sendKillSignal(messageContent.category, messageContent.complexity));
            if (await isCategoryActive(messageContent.category)) {
              operations.push(MessageSource.sendKillSignal(messageContent.category));
            }
            break;
        }

        await Promise.all(operations);
        channel.ack(message);
      } catch (err) {
        console.error(`${new Date().toISOString()} - Error processing message:`, err);
        channel.nack(message);
      }
    }
  });

  console.log(`${new Date().toISOString()} MessageSink: Queue updates listening on queue ${queueName}`);
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

  consumerPromises.push(startMatchedPlayersConsumer());
  consumerPromises.push(startQueueUpdatesConsumer());

  await Promise.all(consumerPromises);
  console.log(`${new Date().toISOString()} MessageSink: All consumers have been started.`);
}

export default { startAllConsumers };
