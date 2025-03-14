import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL_URI || 'amqp://admin:pass@localhost:5672';
const EXCHANGE = '';
const QUEUE_TIMEOUT = process.env.QUEUE_TIMEOUT || 20;
const DEAD_LETTER_QUEUE_TIMEOUT = process.env.DEAD_LETTER_QUEUE_TIMEOUT || 10;

let connection = null;
let channel = null;

async function getChannel() {
  // Reuse an existing channel or creates a new one if none exists.
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
  }
  return channel;
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

export default {
  EXCHANGE,
  QUEUE_TIMEOUT,
  DEAD_LETTER_QUEUE_TIMEOUT,
  getChannel,
  getQueueName,
  getQueueConfiguration,
  getDeadLetterQueueConfiguration,
};
