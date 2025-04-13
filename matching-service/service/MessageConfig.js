import amqp from 'amqplib';
import UuidUtils from '../utils/UuidUtils.js';

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL_URI || 'amqp://admin:pass@localhost:5672';
const EXCHANGE = '';
const FANOUT_EXCHANGE = 'create-queue-exchange';
const QUEUE_TIMEOUT = process.env.QUEUE_TIMEOUT || 30;
const MATCHED_PLAYERS_QUEUE_NAME = 'matched-players';
const UPDATES_QUEUE_NAME = 'queue-updates';

// Natural ordering to complexities
const COMPLEXITY_ORDER = ['easy', 'medium', 'hard'];

function getExpansionDelay(step) {
  const totalDelayMs = QUEUE_TIMEOUT * 1000;

  // For step 0, there is no previous delay.
  if (step === 0) return totalDelayMs * (Math.log(1) / Math.log(COMPLEXITY_ORDER.length + 1)); // which is 0

  // Calculate the absolute delay for the current and previous steps.
  const delayForCurrentStep = totalDelayMs * (Math.log(step + 1) / Math.log(COMPLEXITY_ORDER.length + 1));
  const delayForPreviousStep = totalDelayMs * (Math.log(step) / Math.log(COMPLEXITY_ORDER.length + 1));

  // Return the delta.
  return delayForCurrentStep - delayForPreviousStep;
}

let channelPromise = null;

async function getChannel() {
  if (!channelPromise) {
    channelPromise = (async () => {
      const connection = await amqp.connect(RABBITMQ_URL);
      return await connection.createConfirmChannel();
    })();
  }
  return channelPromise;
}

function generateShortQueueName() {
  const prefix = 'create-event-queue-';
  // Generate a 6-character string from a random number.
  const shortId = UuidUtils.APP_UUID;
  return `${prefix}${shortId}`;
}

function getQueueName(category, complexity) {
  return complexity ? `${category}-${complexity}` : `${category}`;
}

function getQueueConfiguration() {
  return {
    durable: true,
    messageTtl: QUEUE_TIMEOUT * 1000,
  };
}

function getQueueUpdatesConfiguration() {
  // Set exclusive so that only 1 container gets to consume messages from this queue
  // In this way we maintain the ordering of the messages and processing of the messages.
  return {
    messageTtl: 10 * 1000, // 10 seconds message timeout
    exclusive: true,
  };
}

export default {
  COMPLEXITY_ORDER,
  EXCHANGE,
  FANOUT_EXCHANGE,
  QUEUE_TIMEOUT,
  MATCHED_PLAYERS_QUEUE_NAME,
  UPDATES_QUEUE_NAME,
  getChannel,
  getQueueName,
  getQueueConfiguration,
  getQueueUpdatesConfiguration,
  generateShortQueueName,
  getExpansionDelay,
};
