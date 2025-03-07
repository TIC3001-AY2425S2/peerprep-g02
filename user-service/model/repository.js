import 'dotenv/config';
import { connect } from 'mongoose';
import UserModel from './user-model.js';

export async function connectToDB() {
  let mongoDBUri;

  switch (process.env.ENV) {
    case 'PROD':
      mongoDBUri = process.env.DB_CLOUD_URI;
      break;
    case 'DOCKER':
      mongoDBUri = process.env.DB_DOCKER_URI;
      break;
    default:
      mongoDBUri = process.env.DB_LOCAL_URI;
  }

  await connect(mongoDBUri);
}

export async function createUser(username, email, password) {
  return new UserModel({ username, email, password }).save();
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

export async function findUserById(userId) {
  return UserModel.findById(userId);
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [{ username }, { email }],
  });
}

export async function findAllUsers() {
  return UserModel.find();
}

export async function updateUserById(userId, username, email, password) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password,
      },
    },
    { new: true }, // return the updated user
  );
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true }, // return the updated user
  );
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}
