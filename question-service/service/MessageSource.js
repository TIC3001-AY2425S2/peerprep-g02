import MessageConfig from './MessageConfig.js';

async function sendQueueUpdate(type, category, complexity) {
  const queue = MessageConfig.UPDATES_QUEUE_NAME;
  const channel = await MessageConfig.getChannel();

  const message = { type, category, complexity };
  const messageBuffer = Buffer.from(JSON.stringify(message));

  return new Promise(async (resolve, reject) => {
    channel.publish(MessageConfig.EXCHANGE, queue, messageBuffer);
    try {
      await channel.waitForConfirms();
      console.log(`${new Date().toISOString()} - Message successfully published: ${message}`);
      resolve();
    } catch (error) {
      console.error(`${new Date().toISOString()} - Message was nacked:`, error);
      return reject(new Error('Message was nacked'));
    }
  });
}

export default { sendQueueUpdate };
