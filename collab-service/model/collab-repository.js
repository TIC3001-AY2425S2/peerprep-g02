import 'dotenv/config';
import { connect } from 'mongoose';
import CollabModel from './collab-model.js';

export async function connectToDB() {
  const mongoDBUri = process.env.ENV === 'PROD' ? process.env.DB_CLOUD_URI : process.env.DB_LOCAL_URI;

  await connect(mongoDBUri);
}

async function createCollab(user1, user2, questionId) {
  return new CollabModel({ code: '', user1, user2, questionId, status: true }).save();
}

async function updateCollab(collabId, ydoc) {
  await CollabModel.findByIdAndUpdate(collabId, { code: ydoc });
}

async function getActiveCollab(userId) {
  return CollabModel.findOne({
    status: true,
    $or: [{ user1: userId }, { user2: userId }],
  });
}

export default { connectToDB, createCollab, getActiveCollab };
