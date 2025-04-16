const User = require('../models/User'); // Asegúrate de que este modelo exista
const RestrictedUser = require('../models/RestrictedUser');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
  Query: {
    // request to get user from father
    restrictedUserByFather: async (_, { parentUser }, context) => {
      if (!context.user) throw new AuthenticationError('No autenticado');
      return await RestrictedUser.find({ parentUser });
    },
  },
  User: {
    // relationship between User and RestrictedUser
    restrictedUsers: async (parent) => {
      return await RestrictedUser.find({ parentUser: parent._id });
    }
  }
};
