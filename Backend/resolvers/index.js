const userResolvers = require('./user.resolver');
const restrictedUserResolvers = require('./restrictedUser.resolver');
const playlistResolvers = require('./playlist.resolver');
const videoResolvers = require('./video.resolver');

module.exports = {
    Query: {
      ...userResolvers.Query,
      ...restrictedUserResolvers.Query,
      ...playlistResolvers.Query,
      ...videoResolvers.Query
    },
    Mutation: {
      ...userResolvers.Mutation,
      ...restrictedUserResolvers.Mutation,
      ...playlistResolvers.Mutation,
      ...videoResolvers.Mutation
    },
    // all resolvers for each type
    User: userResolvers.User || {}, // if there are no resolvers for User type, it will be an empty object
    RestrictedUser: restrictedUserResolvers.RestrictedUser,
    Playlist: playlistResolvers.Playlist,
    Video: videoResolvers.Video
  };  