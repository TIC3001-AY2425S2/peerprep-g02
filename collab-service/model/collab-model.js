import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CollabModelSchema = new Schema(
  {
    code: {
      type: String,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionModel',
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('CollabModel', CollabModelSchema);
