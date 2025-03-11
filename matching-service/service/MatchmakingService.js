import MessageSource from './MessageSource.js';

/**
 * Enqueues a user for matching.
 * @param {string} userId - The unique user ID.
 * @param {string} category - The category name (used as the exchange).
 * @param {string} complexity - The chosen complexity (used as the routing key).
 */
async function matchmake(userId, category, complexity) {
  // TODO: Set timeout from process.env.timeout
  // Attach the enqueueTime (milliseconds timestamp)
  const enqueueTime = Date.now();
  // Send the message with a TTL of 25 seconds
  return await MessageSource.sendMessage({ userId, category, complexity, enqueueTime });
}

export default { matchmake };
