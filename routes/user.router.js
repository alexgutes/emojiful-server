const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Models
const User = require('../models/users');
const Question = require('../models/questions');

router.get('/', (req, res, next) => {
  User.find()
    .populate('questions')
    .then(users => res.json(users))
    .catch(error => next(error));
});

router.post('/', (req, res, next) => {
  // Extract username and password from the body
  const { username, password } = req.body;

  /* === Validators === */
  // Validate that we've received both
  if (!username || !password) {
    return res.status(422).json({
      code: 422,
      reason: 'Validation error',
      message: 'Missing field'
    });
  }

  // Validate type is string
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(422).json({
      code: 422,
      reason: 'Validation error',
      message: 'Incorrect type, expected string'
    });
  }

  // Validate that there is no leading/trailing whitespace
  if (username !== username.trim() || password !== password.trim()) {
    return res.status(422).json({
      code: 422,
      reason: 'Validation error',
      message: 'Field cannot begin or end with whitespace'
    });
  }

  // Usernames must be >1 character
  if (username.length < 1) {
    return res.status(422).json({
      code: 422,
      reason: 'Validation error',
      message: 'Username is too sthort'
    });
  }

  // Passwords must be 10-72 characters
  if (password.length < 10 || password.length > 72) {
    return res.status(422).json({
      code: 422,
      reason: 'Validation error',
      message: 'Password needs to be between 10-72 characters'
    });
  }

  let resolvedQuestions;

  return Question.find()
    .then(questions => {
      resolvedQuestions = questions.map((question, index) => ({
        question,
        next: index === questions.length - 1 ? null : index + 1
      }));
      return;
    })
    .then(() => {
      return User.hashPassword(password);
    })
    .then(digest => {
      return User.create({
        username,
        password: digest,
        questions: resolvedQuestions
      });
    })
    .then(user => {
      const newUser = {
        head: user.head,
        tail: user.tail,
        id: user._id,
        username: user.username,
        questions: user.questions
      };

      res
        .status(201)
        .location(`/users/${newUser.id}`)
        .json(newUser);
    })
    .catch(err => {
      if (err.code === 11000) {
        return res.status(400).json({
          reason: 'Validation Error',
          message: 'The username already exists',
          location: 'username'
        });
      }
      next(err);
    });
});

module.exports = router;
