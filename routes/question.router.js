// Express
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

// Models
const User = require('../models/users');
const Question = require('../models/questions');

router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

router.get('/', (req, res, next) => {
  const userID = req.user._id;

  User.findById(userID)
    .populate('questions.question')
    .then(user => {
      console.log(user);
      res.json(user.questions[user.head]);
    });
});

router.post('/', (req, res, next) => {
  let { answer } = req.body;

  answer = answer.toLowerCase();

  User.findById(req.user._id)
    .populate('questions.question')
    .then(user => {
      console.log(user);

      let current = user.head,
        tail = user.tail,
        next = null,
        nextNext = null,
        response = '';

      if (user.questions[current].question.description === answer) {
        user.questions[tail].next = current;
        user.tail = current;
        user.head = user.questions[current].next;
        user.questions[current].next;

        response = 'Correct';
      } else {
        next = user.questions[current].next;
        user.head = next;
        nextNext = user.questions[next].next;
        user.questions[next].next = current;
        user.questions[current].next = nextNext;

        response = 'Incorrect';
      }

      user.save();
      return response;
    })
    .then(response => res.send({ message: response }))
    .catch(error => next(error));
});

module.exports = router;
