const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.use(authMiddleware.authenticate);

router.post('/', userController.createRestrictedUser);
router.get('/', userController.getRestrictedUsers);
router.get('/:id', userController.getRestrictedUserById);
router.post('/verify-pin', userController.verifyRestrictedUserPin);
router.post('/main/verify-pin', userController.verifyUserPin);
router.patch('/:id', userController.updateRestrictedUser);
router.delete('/:id', userController.deleteRestrictedUser);

module.exports = router;