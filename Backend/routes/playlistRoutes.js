const express = require('express');
const playlistController = require('../controllers/playlistController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.authenticate);


router.post('/', playlistController.createPlaylist);
router.get('/', playlistController.getPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.get('/playlist/:id', playlistController.getPlaylistsByRestrictedUser);
router.put('/:id', playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);

module.exports = router;