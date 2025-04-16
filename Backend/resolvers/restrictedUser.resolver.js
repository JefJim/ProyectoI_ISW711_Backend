const RestrictedUser = require('../models/RestrictedUser');
const { AuthenticationError } = require('apollo-server-express');

module.exports = {
  Query: {
    // add resolvers if is necessary
  },
  RestrictedUser: {
    // if need to add resolvers for RestrictedUser type
  }
};
