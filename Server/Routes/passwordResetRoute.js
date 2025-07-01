const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const router = express.Router();

// Password Reset Request Route
router.post(
  '/password-reset',
  [check('email', 'Valid email is required').isEmail()],
  authController.requestPasswordReset
);

module.exports = router;
