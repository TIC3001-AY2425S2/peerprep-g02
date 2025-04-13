import MessageConfig from './MessageConfig.js';
import MessageService from './MessageService.js';

/**
 * Starts a consumer for the matched players processing.
 * We want to leave the consumers to only be responsible for matching
 * and leave the processing to another dedicated consumer.
 */
async function startMatchedPlayersConsumer() {
  const channel = await MessageConfig.getChannel();

  const queueName = MessageConfig.MATCHED_PLAYERS_QUEUE_NAME;
  await channel.assertQueue(queueName, MessageConfig.getMatchedPlayersQueueConfiguration());

  channel.consume(
    queueName,
    async (message) => {
      if (message) {
        const messageContent = JSON.parse(message.content.toString());

        const userIds = messageContent.players.map((player) => player.userId).join(', ');
        console.log(`${new Date().toISOString()} MessageSink (Matched players): Received message for users ${userIds}`);

        await MessageService.process(messageContent);
      }
    },
    { noAck: true },
  );

  console.log(`${new Date().toISOString()} MessageSink: Matched players consumer listening on queue ${queueName}`);
}

async function startAllConsumers() {
  await startMatchedPlayersConsumer();
  console.log(`${new Date().toISOString()} MessageSink: All consumers have been started.`);
}

export default { startAllConsumers };
