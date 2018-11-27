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
const questionRouter = require('./routes/question.router');

// Passport
const passport = require('passport');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

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

passport.use(localStrategy);
passport.use(jwtStrategy);

// Mount routers
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/questions', questionRouter);

// Error handlers
// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

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

// Me
// User Story: As a logged in user, I am presented with a word so that I can learn the meaning of the word
// User Story: As a user, I am given feedback to my answer so that I learn the word

// Alex
// User Story: As a user, when I am using the app, my progress should be recorded so I know which questions I got correct or wrong
// User Story: As a user, when I am using the app, I should be able to move to the next word so I can learn more words
