const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    associatedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RestrictedUser' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Playlist', playlistSchema);