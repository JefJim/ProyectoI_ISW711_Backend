const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    associatedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RestrictedUser' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }], //New property
});

module.exports = mongoose.model('Playlist', playlistSchema);