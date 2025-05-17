const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../firebase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { updateProfile, getProfile, login, signup } = require('../controllers/authController');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: 'Validation error', errors: errors.array().map(e => e.msg) });
  next();
};

const generateToken = userId =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

router.post('/signup', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  handleValidationErrors
],signup);

router.post('/login', [
  body('email').optional().isEmail(),
  body('password').optional().notEmpty(),
  handleValidationErrors
], login);

router.get('/profile', auth, getProfile);

router.patch('/profile', [
  auth,
  body('name').optional().trim().notEmpty(),
  body('password').optional().isLength({ min: 6 }),
  handleValidationErrors
],updateProfile);

module.exports = router;