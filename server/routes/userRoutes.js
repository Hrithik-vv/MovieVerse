const express = require('express');
const router = express.Router();
const { getUsers, getUserById, blockUser, deleteUser, updateProfile, changePassword } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.put('/:id/block', protect, admin, blockUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;

