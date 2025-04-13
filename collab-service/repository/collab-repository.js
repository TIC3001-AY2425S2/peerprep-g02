import 'dotenv/config';
import { connect } from 'mongoose';
import CollabHistoryModel from '../model/collab-history-model.js';
import CollabModel from '../model/collab-model.js';
import CollabUserModel from '../model/collab-user-model.js';

async function connectToDB() {
  const mongoDBUri = process.env.ENV === 'PROD' ? process.env.DB_CLOUD_URI : process.env.DB_LOCAL_URI;

  await connect(mongoDBUri);
}

async function createCollab(players, questionId) {
  const collab = await new CollabModel({ code: '', questionId }).save();

  const users = players.map((player) => ({
    userId: player.userId,
    collabId: collab._id,
    active: true,
  }));

  await CollabUserModel.insertMany(users);
  return collab;
}

async function updateCollab(collabId, ydoc) {
  await CollabModel.findByIdAndUpdate(collabId, { code: ydoc });
}

async function getActiveCollab(userId) {
  const participant = await CollabUserModel.findOne({ userId, active: true }).populate({
    path: 'collabId',
    select: 'questionId',
  });

  if (!participant || !participant.collabId) {
    return null;
  }

  return {
    questionId: participant.collabId.questionId,
    userId: participant.user,
    id: participant.collabId._id,
  };
}

async function setInactiveCollabUser(userId) {
  return await CollabUserModel.findOneAndUpdate({ userId, active: true }, { active: false }, { new: true });
}

async function createCollabHistory(collabId, history) {
  return await CollabHistoryModel.create({
    collabId,
    snapshot: history,
  });
}

async function getCollabHistory(collabId, version) {
  return await CollabHistoryModel.findOne({
    collabId: collabId,
    version: version,
  });
}

async function getCollabHistoryVersions(collabId) {
  // Retrieve only the version field for every history snapshot, sorted in ascending order
  const snapshots = await CollabHistoryModel.find({ collabId }).sort({ version: 1 }).select('version createdAt -_id');
  return snapshots.map((snapshot) => ({
    version: snapshot.version,
    createdAt: snapshot.createdAt,
  }));
}

export default {
  connectToDB,
  createCollab,
  updateCollab,
  getActiveCollab,
  setInactiveCollabUser,
  createCollabHistory,
  getCollabHistory,
  getCollabHistoryVersions,
};
