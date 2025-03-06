const Playlist = require('../models/Playlist');

// Crear una playlist
exports.createPlaylist = async (req, res) => {
    const { name, associatedProfiles } = req.body;

    try {
        const playlist = new Playlist({ name, associatedProfiles, createdBy: req.user.userId });
        await playlist.save();

        res.status(201).json({ message: 'Playlist creada exitosamente', playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las playlists
exports.getPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ createdBy: req.user.userId });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una playlist
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

// Eliminar una playlist
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