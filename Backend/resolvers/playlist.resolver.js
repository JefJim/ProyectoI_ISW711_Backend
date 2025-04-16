const Playlist = require('../models/Playlist');
const User = require('../models/User');
const RestrictedUser = require('../models/RestrictedUser');
const Video = require('../models/Video');

module.exports = {
  Query: {
    //load all playlists by creator
    playlistsByCreator: async (_, { parentUser }, context) => {
      if (!context.user) throw new AuthenticationError('No autenticado');
      return await Playlist.find({ createdBy: parentUser });
    }
  },
  Playlist: {
    createdBy: async (parent) => {
      if (!parent.createdBy) return null;
      return await User.findById(parent.createdBy);
    },
    associatedProfiles: async (parent) => {
      if (!parent.associatedProfiles || parent.associatedProfiles.length === 0) return [];
      return await RestrictedUser.find({ _id: { $in: parent.associatedProfiles } });
    },
    videos: async (parent) => {
      if (!parent.videos || parent.videos.length === 0) return [];
      return await Video.find({ _id: { $in: parent.videos } });
    }
  }
};
