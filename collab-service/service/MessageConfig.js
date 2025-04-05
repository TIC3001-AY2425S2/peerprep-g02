import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL_URI || 'amqp://admin:pass@localhost:5672';
const EXCHANGE = '';
const MATCHED_PLAYERS_QUEUE_NAME = 'matched-players';

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

function getMatchedPlayersQueueConfiguration() {
  return {
    durable: true,
  };
}

export default {
  EXCHANGE,
  getChannel,
  MATCHED_PLAYERS_QUEUE_NAME,
  getMatchedPlayersQueueConfiguration,
};
