import MatchingStatusEnum from '../enum/MatchingStatusEnum.js';
import {
  getMatchStatus,
  isCategoryComplexityActive,
  setDistinctCategoryComplexity,
} from '../repository/redis-repository.js';
import MessageConfig from './MessageConfig.js';

// DOMAIN EXPANSION
function sendCategoryComplexityMessageSide({ userId, sessionId, category, complexity, side, expansion }) {
  // On user's chosen complexity, expansion = 0.
  const index = MessageConfig.COMPLEXITY_ORDER.indexOf(complexity);
  let newComplexity;
  if (side === 'left') {
    newComplexity = MessageConfig.COMPLEXITY_ORDER[index - expansion];
  } else {
    newComplexity = MessageConfig.COMPLEXITY_ORDER[index + expansion];
  }
  if (!newComplexity) return;

  // For expansion = 0, skip sending for the right side to avoid duplicate.
  if (expansion === 0 && side === 'right') {
    // Continue the expansion for the right side.
    return sendCategoryComplexityMessageSide({
      userId,
      sessionId,
      category,
      complexity,
      side,
      expansion: expansion + 1,
    });
  }

  // Delay and check waiting status
  const delay = MessageConfig.getExpansionDelay(expansion);
  setTimeout(async () => {
    const status = await getMatchStatus(userId, sessionId);
    if (status !== MatchingStatusEnum.WAITING) return;

    // Only send message if the category + complexity exists
    if (await isCategoryComplexityActive(category, newComplexity)) {
      const queueName = MessageConfig.getQueueName(category, newComplexity);
      const channel = await MessageConfig.getChannel();
      const message = { userId, sessionId, category, complexity: newComplexity, enqueueTime: Date.now(), expansion };
      channel.publish(MessageConfig.EXCHANGE, queueName, Buffer.from(JSON.stringify(message)));
      console.log(
        `${new Date().toISOString()} MessageSource: Sent message for user ${userId} to queue ${queueName} (side ${side}, expansion ${expansion})`,
      );
    }

    // Recursively expand in a radius to neighbouring complexities.
    sendCategoryComplexityMessageSide({
      userId,
      sessionId,
      category,
      complexity,
      side,
      expansion: expansion + 1,
    });
  }, delay);
}

/**
 * Publishes a message to the appropriate category-complexity queue.
 */
async function sendCategoryComplexityMessage({ userId, sessionId, category, complexity }) {
  sendCategoryComplexityMessageSide({ userId, sessionId, category, complexity, side: 'left', expansion: 0 });
  sendCategoryComplexityMessageSide({ userId, sessionId, category, complexity, side: 'right', expansion: 0 });
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

  // If filteredCategoryComplexity is empty, there is no need to send a message.
  if (filteredCategoryComplexity.length === 0) {
    console.log(`${new Date().toISOString()} - No create event needed as there are no new queues to create.`);
    return Promise.resolve();
  }

  // For each element in categoryQueues, create a redis set entry.
  const redisPromises = filteredCategoryComplexity.map((cat) => setDistinctCategoryComplexity(cat, complexity));
  await Promise.all(redisPromises);

  const message = {
    categoryComplexityQueues: filteredCategoryComplexity,
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
  sendMatchedPlayersMessage,
  sendCreateEvent,
  sendKillSignal,
};
