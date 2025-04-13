import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL_URI || 'amqp://admin:pass@localhost:5672';
const EXCHANGE = '';
const MATCHED_PLAYERS_QUEUE_NAME = 'matched-players';

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
