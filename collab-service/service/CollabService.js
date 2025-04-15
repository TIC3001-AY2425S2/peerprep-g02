import CollabRepository from '../repository/collab-repository.js';

async function getCollab(userId) {
  const activeCollab = await CollabRepository.getActiveCollab(userId);

  if (!activeCollab) {
    throw new Error(`CollabService: No active collab found for ${userId}`);
  }

  return activeCollab;
}

async function createCollab(players, questionId) {
  try {
    const collab = await CollabRepository.createCollab(players, questionId);
    // console.log(`CollabService: Created collab ${collab}`);
  } catch (error) {
    console.log('CollabService: Error occurred while creating collab', error);
  }
}

export default { getCollab, createCollab };
