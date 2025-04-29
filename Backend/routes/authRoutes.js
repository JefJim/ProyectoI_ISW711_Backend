const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuthController'); //google routes


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authController.verifyUser);
router.post('/verify-code', authController.verifyCode);

//google routes
router.post('/google', googleAuthController.googleAuth);
router.post('/google/complete', googleAuthController.completeGoogleRegistration);

module.exports = router;