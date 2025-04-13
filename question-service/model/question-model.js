import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const QuestionModelSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: [String],
    required: true,
    set: (arr) => arr.map((str) => str.trim().toLowerCase()),
  },
  complexity: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  // isDeleted: {
  //   type: Boolean,
  //   default: false,
  // },
});

// QuestionModelSchema.query.notDeleted = function () {
//   return this.where({ isDeleted: false });
// };

export default mongoose.model('QuestionModel', QuestionModelSchema);
