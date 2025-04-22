const Playlist = require('../models/Playlist');
const mongoose = require('mongoose');
const RestrictedUser = require('../models/RestrictedUser'); 
// Crear playlist
exports.createPlaylist = async (req, res) => {
    const { name, associatedProfiles } = req.body;
    const createdBy = req.user.userId;

    try {
        // Validación básica
        if (!name) {
            return res.status(400).json({ error: 'El nombre de la playlist es requerido' });
        }

        const playlist = new Playlist({ 
            name, 
            associatedProfiles: associatedProfiles || [], 
            createdBy, 
            videos: [] 
        }); 

        await playlist.save();

        res.status(201).json({ 
            success: true,
            message: 'Playlist creada exitosamente', 
            data: playlist 
        });
    } catch (error) {
        console.error('Error al crear playlist:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo crear la playlist' 
        });
    }
};

// Obtener playlists del usuario
exports.getPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ createdBy: req.user.userId })
            .populate('associatedProfiles', 'fullName avatar')
            .populate('videos', 'name url thumbnail duration');

        res.status(200).json({ 
            success: true,
            count: playlists.length,
            data: playlists 
        });
    } catch (error) {
        console.error('Error al obtener playlists:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener las playlists' 
        });
    }
};

// Obtener playlist por ID
exports.getPlaylistById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const playlist = await Playlist.findOne({ _id: id, createdBy: userId })
            .populate('associatedProfiles', 'fullName avatar')
            .populate('videos', 'name url thumbnail duration');

        if (!playlist) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Playlist no encontrada o no tienes permisos' 
            });
        }

        res.status(200).json({ 
            success: true,
            data: playlist 
        });
    } catch (error) {
        console.error('Error al obtener playlist:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo obtener la playlist' 
        });
    }
};

// Obtener playlists por usuario restringido
exports.getPlaylistsByRestrictedUser = async (req, res) => {
    const userId = req.params.id;
    console.log('userId:', userId);
    try {
        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'ID de usuario no válido' });
        }
        // Verificar que el usuario restringido pertenece al usuario actual
        const restrictedUser = await RestrictedUser.findOne({ 
            _id: mongoose.Types.ObjectId(userId), 
            parentUser: mongoose.Types.ObjectId(req.user.userId)
        });

        if (!restrictedUser) {
            return res.status(403).json({ 
                error: 'No autorizado',
                message: 'No tienes permisos para acceder a estas playlists' 
            });
        }

        // Obtener playlists
        const playlists = await Playlist.find({ 
            associatedProfiles: userId,
        }).populate('videos');

        res.status(200).json({ 
            success: true,
            count: playlists.length,
            data: playlists 
        });
    } catch (error) {
        console.error('Error al obtener playlists por usuario restringido:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener las playlists' 
        });
    }
};

// Actualizar playlist
exports.updatePlaylist = async (req, res) => {
    const { id } = req.params;
    const { name, associatedProfiles } = req.body;
    const userId = req.user.userId;

    try {
        const playlist = await Playlist.findOneAndUpdate(
            { _id: id, createdBy: userId },
            { name, associatedProfiles },
            { new: true, runValidators: true }
        );

        if (!playlist) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Playlist no encontrada o no tienes permisos' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Playlist actualizada exitosamente', 
            data: playlist 
        });
    } catch (error) {
        console.error('Error al actualizar playlist:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo actualizar la playlist' 
        });
    }
};

// Eliminar playlist
exports.deletePlaylist = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const playlist = await Playlist.findOneAndDelete({ 
            _id: id, 
            createdBy: userId 
        });

        if (!playlist) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Playlist no encontrada o no tienes permisos' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Playlist eliminada exitosamente',
            data: {
                id: playlist._id,
                name: playlist.name
            }
        });
    } catch (error) {
        console.error('Error al eliminar playlist:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo eliminar la playlist' 
        });
    }
};