const Video = require('../models/Video');
const Playlist = require('../models/Playlist');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
  Query: {
    playlistVideos: async (_, { playlistId, userId }, context) => {
      if (!context.user) throw new AuthenticationError('No autenticado');
      
      // Verifica que la playlist pertenezca al usuario
      const playlist = await Playlist.findOne({
        _id: playlistId,
        createdBy: userId
      }).populate('videos');

      if (!playlist) {
        throw new Error('No tienes permisos para ver estos videos');
      }

      return playlist.videos;
    }
  },
  Video: {
    playlist: async (parent) => {
      if (!parent.playlist) return null; // Maneja casos nulos
      return await Playlist.findById(parent.playlist);
    }
  }
};
