const Video = require('../models/Video');
const axios = require('axios');
const Playlist = require('../models/Playlist');
const { isValidYouTubeUrl, extractVideoId } = require('../utils/youtubeUtils');

// Crear video
exports.createVideo = async (req, res) => {
    const { name, url, description, playlist } = req.body;
    const userId = req.user.userId;

    try {
        // Validación básica
        if (!name || !url || !playlist) {
            return res.status(400).json({ error: 'Nombre, URL y playlist son requeridos' });
        }

        // Validar URL de YouTube
        if (!isValidYouTubeUrl(url)) {
            return res.status(400).json({ error: 'URL de YouTube no válida' });
        }

        // Verificar que la playlist pertenece al usuario
        const playlistExists = await Playlist.findOne({ 
            _id: playlist, 
            createdBy: userId 
        });

        if (!playlistExists) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Playlist no encontrada o no tienes permisos' 
            });
        }

        // Extraer ID del video
        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'No se pudo extraer el ID del video de YouTube' });
        }

        // Obtener información del video de YouTube
        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails`
        );

        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({ error: 'Video de YouTube no encontrado' });
        }

        const videoInfo = response.data.items[0];

        // Crear el video
        const video = new Video({
            name,
            url,
            description,
            playlist,
            duration: videoInfo.contentDetails.duration,
            thumbnail: videoInfo.snippet.thumbnails.medium.url || videoInfo.snippet.thumbnails.default.url,
            createdBy: userId
        });

        await video.save();

        // Actualizar la playlist
        await Playlist.findByIdAndUpdate(
            playlist, 
            { $push: { videos: video._id } },
            { new: true }
        );

        res.status(201).json({ 
            success: true,
            message: 'Video creado exitosamente', 
            data: video 
        });
    } catch (error) {
        console.error('Error al crear video:', error);
        
        let errorMessage = 'Error al crear el video';
        if (error.response && error.response.status === 404) {
            errorMessage = 'Video de YouTube no encontrado';
        } else if (error.response && error.response.status === 403) {
            errorMessage = 'Acceso no autorizado a la API de YouTube';
        }

        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: errorMessage 
        });
    }
};

// Obtener videos por playlist
exports.getVideosByPlaylist = async (req, res) => {
    const { playlistId } = req.params;
    const userId = req.user.userId;

    try {
        // Verificar que la playlist pertenece al usuario
        const playlist = await Playlist.findOne({ 
            _id: playlistId, 
            createdBy: userId 
        });

        if (!playlist) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Playlist no encontrada o no tienes permisos' 
            });
        }

        const videos = await Video.find({ playlist: playlistId });

        res.status(200).json({ 
            success: true,
            count: videos.length,
            data: videos 
        });
    } catch (error) {
        console.error('Error al obtener videos por playlist:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los videos' 
        });
    }
};

// Obtener video por ID
exports.getVideoById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const video = await Video.findById(id).populate('playlist', 'name createdBy');

        if (!video) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Video no encontrado' 
            });
        }

        // Verificar que el video pertenece a una playlist del usuario
        if (video.playlist.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ 
                error: 'No autorizado',
                message: 'No tienes permisos para acceder a este video' 
            });
        }

        res.status(200).json({ 
            success: true,
            data: video 
        });
    } catch (error) {
        console.error('Error al obtener video:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo obtener el video' 
        });
    }
};

// Actualizar video
exports.updateVideo = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.userId;

    try {
        // Verificar que el video pertenece al usuario
        const video = await Video.findOne({ _id: id })
            .populate('playlist', 'createdBy');

        if (!video || video.playlist.createdBy.toString() !== userId.toString()) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Video no encontrado o no tienes permisos' 
            });
        }

        const updatedVideo = await Video.findByIdAndUpdate(
            id,
            { name, description },
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            success: true,
            message: 'Video actualizado exitosamente', 
            data: updatedVideo 
        });
    } catch (error) {
        console.error('Error al actualizar video:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo actualizar el video' 
        });
    }
};

// Eliminar video
exports.deleteVideo = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        // Verificar que el video pertenece al usuario
        const video = await Video.findOne({ _id: id })
            .populate('playlist', 'createdBy');

        if (!video || video.playlist.createdBy.toString() !== userId.toString()) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Video no encontrado o no tienes permisos' 
            });
        }

        // Eliminar el video
        await Video.findByIdAndDelete(id);

        // Actualizar la playlist
        await Playlist.findByIdAndUpdate(
            video.playlist._id, 
            { $pull: { videos: id } },
            { new: true }
        );

        res.status(200).json({ 
            success: true,
            message: 'Video eliminado exitosamente',
            data: {
                id: video._id,
                name: video.name
            }
        });
    } catch (error) {
        console.error('Error al eliminar video:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo eliminar el video' 
        });
    }
};