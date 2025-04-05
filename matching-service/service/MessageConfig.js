import amqp from 'amqplib';
import UuidUtils from '../utils/UuidUtils.js';

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL_URI || 'amqp://admin:pass@localhost:5672';
const EXCHANGE = '';
const FANOUT_EXCHANGE = 'create-queue-exchange';
const QUEUE_TIMEOUT = process.env.QUEUE_TIMEOUT || 20;
const DEAD_LETTER_QUEUE_TIMEOUT = process.env.DEAD_LETTER_QUEUE_TIMEOUT || 10;
const MATCHED_PLAYERS_QUEUE_NAME = 'matched-players';
const UPDATES_QUEUE_NAME = 'queue-updates';

let connection = null;
let channel = null;

async function getChannel() {
  // Reuse an existing channel or creates a new one if none exists.
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createConfirmChannel();
  }
  return channel;
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

function getQueueConfiguration(category) {
  return {
    durable: true,
    messageTtl: QUEUE_TIMEOUT * 1000,
    // Use default exchange with category routing key
    deadLetterExchange: '',
    arguments: {
      'x-dead-letter-routing-key': category,
    },
  };
}

function getDeadLetterQueueConfiguration() {
  return {
    durable: true,
    messageTtl: DEAD_LETTER_QUEUE_TIMEOUT * 1000,
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
  EXCHANGE,
  FANOUT_EXCHANGE,
  QUEUE_TIMEOUT,
  DEAD_LETTER_QUEUE_TIMEOUT,
  MATCHED_PLAYERS_QUEUE_NAME,
  UPDATES_QUEUE_NAME,
  getChannel,
  getQueueName,
  getQueueConfiguration,
  getDeadLetterQueueConfiguration,
  getQueueUpdatesConfiguration,
  generateShortQueueName,
};
