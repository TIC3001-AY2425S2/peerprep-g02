import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL_URI || 'amqp://admin:pass@localhost:5672';
const EXCHANGE = '';
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

function getQueueUpdatesConfiguration() {
  return {
    durable: true,
    messageTtl: 5 * 1000, // 5 seconds message timeout
  };
}

export default {
  EXCHANGE,
  UPDATES_QUEUE_NAME,
  getChannel,
  getQueueUpdatesConfiguration,
};
