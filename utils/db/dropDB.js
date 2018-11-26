const mongoose = require('mongoose');
const { DATABASE_URL } = require('../../config');

console.log('Connecting to database');

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log('Dropping database...');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.log('Disconnecting from database...');
    return mongoose.disconnect();
  })
  .catch(error => {
    console.error(error);
    return mongoose.disconnect();
  });
