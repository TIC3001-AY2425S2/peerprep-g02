import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CollabModelSchema = new Schema(
  {
    code: {
      type: String,
    },
    user1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' },
  },
);

// Ensure a user1 can only have one active collab
CollabModelSchema.index({ user1: 1 }, { unique: true, partialFilterExpression: { status: true } });

// Ensure a user2 can only have one active collab
CollabModelSchema.index({ user2: 1 }, { unique: true, partialFilterExpression: { status: true } });

export default mongoose.model('CollabModel', CollabModelSchema);
