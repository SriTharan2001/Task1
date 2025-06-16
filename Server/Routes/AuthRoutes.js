const express = require('express');
const { register, login, getUsers, forgotPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.post('/forgot-password', forgotPassword);

module.exports = router;
