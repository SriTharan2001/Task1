const express = require('express');
const router = express.Router();

const { 
  register, 
  getAllUsers, 
  login, 
  updateUser, 
  deleteUser 
} = require('../controllers/authController');

// Login
router.post('/login', login);

// Register
router.post('/register', register);

// Get all users
router.get('/users', getAllUsers);

// Update a user
router.put('/users/:id', updateUser);

// Delete a user
router.delete('/users/:id', deleteUser);

module.exports = router;
