const Playlist = require('../models/Playlist');
const mongoose = require('mongoose');

// Create a playlist
exports.createPlaylist = async (req, res) => {
    const { name, associatedProfiles } = req.body;
    try {
        const playlist = new Playlist({ name, associatedProfiles, createdBy: req.user.userId, videos: [] });
        await playlist.save();

        res.status(201).json({ message: 'Playlist creada exitosamente', playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all playlists
exports.getPlaylists = async (req, res) => {
    try {
        // Search for playlists created by the user and populate the associated profiles' full names
        const playlists = await Playlist.find({ createdBy: req.user.userId })
            .populate('associatedProfiles', 'fullName'); // Populate with the 'fullName' field
        if (!playlists || playlists.length === 0) {
            return res.status(404).json({ error: 'No se encontraron playlists' });
        }

        // Return the playlists with the associated profiles' full names
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get a playlist by ID
exports.getPlaylistById = async (req, res) => {
    try {
        const playlistId = req.params.id;

        // search for the playlist by ID and populate the associated profiles' full names
        const playlist = await Playlist.findById(playlistId)
            .populate('associatedProfiles', 'fullName'); // Populate with the 'fullName' field

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist no encontrada' });
        }

        // return the playlist with the associated profiles' full names
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// get playlists by restricted user

exports.getPlaylistsByRestrictedUser = async (req, res) => {
    const userId = req.params;
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'ID de usuario no válidos' });
    }

    try {
        // Convert the userId to an ObjectId
        const userIdObjectId = mongoose.Types.ObjectId(userId);

        // Search for playlists associated with the user
        const playlists = await Playlist.find({ associatedProfiles: userIdObjectId }).populate('videos');
        res.json(playlists);
    } catch (error) {
        console.error('Error al obtener las playlists:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
// update a playlist
exports.updatePlaylist = async (req, res) => {
    const { id } = req.params;
    const { name, associatedProfiles } = req.body;

    try {
        const playlist = await Playlist.findByIdAndUpdate(
            id,
            { name, associatedProfiles },
            { new: true }
        );

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist no encontrada' });
        }

        res.json({ message: 'Playlist actualizada exitosamente', playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// delete a playlist
exports.deletePlaylist = async (req, res) => {
    const { id } = req.params;

    try {
        const playlist = await Playlist.findByIdAndDelete(id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist no encontrada' });
        }

        res.json({ message: 'Playlist eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};