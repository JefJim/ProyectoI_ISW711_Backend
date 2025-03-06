const Video = require('../models/Video');
const axios = require('axios');

// Crear un video
exports.createVideo = async (req, res) => {
    const { name, url, description, playlist } = req.body;

    try {
        // Obtener información del video de YouTube
        const videoId = extractVideoId(url); // Función para extraer el ID del video de la URL
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

        res.status(201).json({ message: 'Video creado exitosamente', video });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los videos de una playlist
exports.getVideosByPlaylist = async (req, res) => {
    const { playlistId } = req.params;

    try {
        const videos = await Video.find({ playlist: playlistId });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un video
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

// Eliminar un video
exports.deleteVideo = async (req, res) => {
    const { id } = req.params;

    try {
        const video = await Video.findByIdAndDelete(id);

        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        res.json({ message: 'Video eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para extraer el ID del video de la URL de YouTube
const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};