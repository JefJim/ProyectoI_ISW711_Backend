const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authController.verifyUser);
router.post('/verify-code', authController.verifyCode);

module.exports = router;