import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CollabUserModelSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    collabId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollabModel',
      required: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Ensure only 1 user can have an active: true record
CollabUserModelSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { active: true } });

export default mongoose.model('CollabUserModel', CollabUserModelSchema);
