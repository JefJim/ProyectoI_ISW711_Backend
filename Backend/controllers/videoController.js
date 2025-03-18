const Video = require('../models/Video');
const axios = require('axios');
const Playlist = require('../models/Playlist');

// Create a video
exports.createVideo = async (req, res) => {
    const { name, url, description, playlist } = req.body;

    try {
        // Get video info from YouTube API
        const videoId = extractVideoId(url); // function to extract video ID from URL
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails`);
        const videoInfo = response.data.items[0];

        const video = new Video({
            name,
            url,
            description,
            playlist,
            duration: videoInfo.contentDetails.duration,
            thumbnail: videoInfo.snippet.thumbnails.default.url,
        });

        await video.save();

        // Update the playlist to add the video ID
        await Playlist.findByIdAndUpdate(playlist, { $push: { videos: video._id } });

        res.status(201).json({ message: 'Video creado exitosamente', video });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get all videos of a playlist
exports.getVideosByPlaylist = async (req, res) => {
    const { playlistId } = req.params;

    try {
        const videos = await Video.find({ playlist: playlistId });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a video by ID
exports.getVideoById = async (req, res) => {
    try {
        const videoId = req.params.id; // get video ID from URL
        const video = await Video.findById(videoId); // Search for the video by ID

        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        res.json(video); // return the video
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a video
exports.updateVideo = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const video = await Video.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        res.json({ message: 'Video actualizado exitosamente', video });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a video
exports.deleteVideo = async (req, res) => {
    const { id } = req.params;

    try {
        // Get the video by ID to know the playlist it belongs to
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        // Delete the video
        await Video.findByIdAndDelete(id);

        // Update the playlist to remove the video ID
        await Playlist.findByIdAndUpdate(video.playlist, { $pull: { videos: id } });

        res.json({ message: 'Video eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to extract video ID from YouTube URL
const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};