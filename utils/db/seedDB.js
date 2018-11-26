const mongoose = require('mongoose');
const { DATABASE_URL } = require('../../config');

// Models
const Question = require('../../models/questions');
const User = require('../../models/users');

// Seeds
const seedQuestions = require('./seed/questions.json');
const seedUsers = require('./seed/users.json');

console.log(`Connecting to mongodb at ${DATABASE_URL}`);

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.info('Dropping Database...');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database...');
    return Promise.all([
      Question.insertMany(seedQuestions),
      Question.createIndexes(),
      User.insertMany(seedUsers),
      User.createIndexes()
    ]);
  })
  .then(() => {
    console.info('Disconnecting...');
    return mongoose.disconnect();
  })
  .catch(error => {
    console.error(error);
    return mongoose.disconnect();
  });
