import MessageConfig from './MessageConfig.js';
import MessageService from './MessageService.js';
import QuestionServiceApiProvider from './QuestionServiceApiProvider.js';

/**
 * Creates a queue for a specific category/complexity queue.
 * Also creates a consumer to process messages.
 */
export async function startQueueConsumer(category, complexity) {
  const queueName = MessageConfig.getQueueName(category, complexity);

  const channel = await MessageConfig.getChannel();
  await channel.assertQueue(queueName, MessageConfig.getQueueConfiguration(category));

  const processor = MessageService.createNormalProcessor();

  channel.consume(queueName, async (message) => {
    if (message) {
      const messageContent = JSON.parse(message.content.toString());
      console.log(
        `${new Date().toISOString()} MessageSink: Received message for user ${messageContent.userId} on queue ${queueName}`,
      );
      await processor(messageContent);
      channel.ack(message);
    }
  });

  console.log(`${new Date().toISOString()} MessageSink: Listening on queue ${queueName}`);
}

/**
 * Starts a consumer for the dead-letter queue for a given category.
 * Also creates a consumer to process dead-letter messages.
 */
export async function startDeadLetterConsumer(category) {
  const channel = await MessageConfig.getChannel();

  const deadLetterQueue = MessageConfig.getQueueName(category);
  await channel.assertQueue(deadLetterQueue, MessageConfig.getDeadLetterQueueConfiguration());

  const processor = MessageService.createDeadLetterProcessor();

  channel.consume(deadLetterQueue, async (message) => {
    if (message) {
      const messageContent = JSON.parse(message.content.toString());
      console.log(`${new Date().toISOString()} MessageSink (DeadLetter): Received message for user ${messageContent.userId}`);
      await processor(messageContent);
      channel.ack(message);
    }
  });

  console.log(`${new Date().toISOString()} MessageSink: Dead-letter consumer listening on queue ${deadLetterQueue}`);
}

/**
 * Starts all consumers for the defined categories and complexities.
 * For each category, it creates a consumer for every complexity and also starts the dead-letter consumer.
 */
export async function startAllConsumers() {
  const [categories, complexities] = await Promise.all([
    QuestionServiceApiProvider.getAllCategories(),
    QuestionServiceApiProvider.getAllComplexities(),
  ]);

  const consumerPromises = [];

  for (const category of categories) {
    for (const complexity of complexities) {
      consumerPromises.push(startQueueConsumer(category, complexity));
    }
    consumerPromises.push(startDeadLetterConsumer(category));
  }
  await Promise.all(consumerPromises);
  console.log(`${new Date().toISOString()} MessageSink: All consumers have been started.`);
}

export default { startAllConsumers };
