const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
});

module.exports = mongoose.model('Video', videoSchema);