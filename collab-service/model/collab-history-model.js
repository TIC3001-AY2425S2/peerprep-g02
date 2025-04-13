import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// This is used for us to have an atomic counter within mongodb.
const CounterSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model('Counter', CounterSchema);

const CollabHistoryModelSchema = new Schema(
  {
    collabId: {
      type: String,
      required: true,
    },
    snapshot: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

CollabHistoryModelSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counterKey = `collabHistoryVersion-${this.collabId}`;
      const counter = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );
      this.version = counter.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('CollabHistoryModel', CollabHistoryModelSchema);
