import MessageSource from './MessageSource.js';

async function matchmake(userId, category, complexity) {
  const enqueueTime = Date.now();
  return MessageSource.sendMessage({ userId, category, complexity, enqueueTime });
}

export default { matchmake };
