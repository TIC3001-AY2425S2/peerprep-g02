import CollabRepository from '../model/collab-repository.js';

async function getCollab(userId) {
  const activeCollab = await CollabRepository.getActiveCollab(userId);

  if (!activeCollab) {
    throw new Error(`No active collab found for ${userId}`);
  }

  return activeCollab;
}

export default { getCollab };
