import {
  isCategoryActive,
  isCategoryComplexityActive,
  setDistinctCategoryComplexity,
} from '../repository/redis-repository.js';
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

async function sendCreateEvent(category, complexity) {
  const channel = await MessageConfig.getChannel();

  // At this point before sending out the actual message to create the queues we must determine which queues need
  // to be created. Since at this point we still can use redis as source of truth and can be sure there are no
  // amendments made to it. Only after the messages are sent out to create the queues, we can update the redis.

  // Filter out categories that already have an active category + complexity
  const filteredCategoryComplexityPromises = category.map(async (cat) => {
    const activeForComplexity = await isCategoryComplexityActive(cat, complexity);
    return activeForComplexity ? null : cat;
  });
  const filteredCategoryComplexity = (await Promise.all(filteredCategoryComplexityPromises)).filter(Boolean);

  // Filter out categories that already exists
  const filteredCategoryPromises = category.map(async (cat) => {
    const exists = await isCategoryActive(cat);
    return exists ? null : cat;
  });
  const filteredCategory = (await Promise.all(filteredCategoryPromises)).filter(Boolean);

  // If filteredCategoryComplexity is empty, there is no need to send a message.
  // Implicitly it would also mean filteredCategory is empty since that is our dead-letter queue.
  if (filteredCategoryComplexity.length === 0) {
    console.log(`${new Date().toISOString()} - No create event needed as there are no new queues to create.`);
    return Promise.resolve();
  }

  // For each element in categoryQueues, create a redis set entry.
  const redisPromises = filteredCategoryComplexity.map((cat) => setDistinctCategoryComplexity(cat, complexity));
  await Promise.all(redisPromises);

  const message = {
    categoryComplexityQueues: filteredCategoryComplexity,
    categoryQueues: filteredCategory,
    complexity,
  };

  return new Promise(async (resolve, reject) => {
    // Publish to the fanout exchange so that all queues bound to it receive the message.
    const messageBuffer = Buffer.from(JSON.stringify(message));
    channel.publish(MessageConfig.FANOUT_EXCHANGE, '', messageBuffer);
    try {
      await channel.waitForConfirms();
      console.log(`${new Date().toISOString()} - Create event published successfully.`);
      resolve();
    } catch (error) {
      console.error(`${new Date().toISOString()} - Error publishing create event:`, error);
      return reject(new Error('Create event message was nacked'));
    }
  });
}

async function sendKillSignal(category, complexity) {
  const queueName = MessageConfig.getQueueName(category, complexity);
  const channel = await MessageConfig.getChannel();
  const message = { isShutdown: true };

  return new Promise(async (resolve, reject) => {
    channel.publish(MessageConfig.EXCHANGE, queueName, Buffer.from(JSON.stringify(message)));
    try {
      await channel.waitForConfirms();
      console.log(`${new Date().toISOString()} - Kill signal successfully sent to ${queueName}`);
      resolve();
    } catch (error) {
      console.error(`${new Date().toISOString()} - Error sending kill signal:`, error);
      return reject(new Error('Kill signal message was nacked'));
    }
  });
}

export default {
  sendCategoryComplexityMessage,
  sendCategoryMessage,
  sendMatchedPlayersMessage,
  sendCreateEvent,
  sendKillSignal,
};
