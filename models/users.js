const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  questions: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      next: { type: Number }
    }
  ],
  head: { type: Number, default: 0 },
  tail: { type: Number, default: 4 }
});

userSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, result) => {
    delete result._id, delete result.__v, delete result.password;
  }
});

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);
