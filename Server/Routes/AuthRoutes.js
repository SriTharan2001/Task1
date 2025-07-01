const express = require('express');
const router = express.Router();

const { register, getAllUsers, login,updateUser,deleteUser } = require('../controllers/authController');

// Login Route (using controller)
router.post('/login', login);

// Register Route
router.post('/register', register);

// Get all users
router.get('/users', getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id",deleteUser);


module.exports = router;
