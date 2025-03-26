import MessageConfig from './MessageConfig.js';

async function sendQueueUpdate(type, category, complexity) {
  const queue = MessageConfig.UPDATES_QUEUE_NAME;

  const channel = await MessageConfig.getChannel();
  await channel.assertQueue(queue, MessageConfig.getQueueUpdatesConfiguration(category));

  const message = { type, category, complexity };
  const messageBuffer = Buffer.from(JSON.stringify(message));

  return new Promise((resolve, reject) => {
    channel.publish(MessageConfig.EXCHANGE, queue, messageBuffer, (err, ok) => {
      if (err) {
        console.error(`${new Date().toISOString()} - Message was nacked:`, err);
        return reject(new Error('Message was nacked'));
      }
      console.log(`${new Date().toISOString()} - Message successfully published: ${message}`);
      resolve(ok);
    });
  });
}

export default { sendQueueUpdate };
