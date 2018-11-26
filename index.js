// Express
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Database
const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');

// Routers
const userRouter = require('./routes/user.router');
const authRouter = require('./routes/auth.router');

// Passport
const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

passport.use(localStrategy);
passport.use(jwtStrategy);

const app = express();

// Logging
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

// CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// Body parser
app.use(express.json());

// Mount routers
app.use('/users', userRouter);
app.use('/auth', authRouter);

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
