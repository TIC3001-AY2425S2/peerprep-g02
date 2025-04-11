import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_LOCAL_URI || 'amqp://admin:pass@localhost:5672';
const EXCHANGE = '';
const UPDATES_QUEUE_NAME = 'queue-updates';

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
