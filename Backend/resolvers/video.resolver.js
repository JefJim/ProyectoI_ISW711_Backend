const Video = require('../models/Video');
const Playlist = require('../models/Playlist');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
  Query: {
    videos: async (_, __, context) => {
      if (!context.user) throw new AuthenticationError('No autenticado');
      return await Video.find({}); 
    },
    searchVideos: async (_, { keyword }, context) => {
      if (!context.user) throw new AuthenticationError('No autenticado');
      return await Video.find({ name: { $regex: keyword, $options: 'i' } });
    }
  },
  Video: {
    playlist: async (parent) => {
      return await Playlist.findById(parent.playlistId); 
    }
  }
};
