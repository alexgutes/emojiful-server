const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/users');

const localStrategy = new LocalStrategy((username, password, done) => {
  let user;

  User.findOne({ username })
    .then(results => {
      user = results;

      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username'
        });
      }

      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password'
        });
      }

      return done(null, user);
    })
    .catch(error => {
      if (error.reason === 'LoginError') {
        return done(null, false);
      }
      return done(error);
    });
});

module.exports = localStrategy;
