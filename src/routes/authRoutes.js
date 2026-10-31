const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', authMiddleware, authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
