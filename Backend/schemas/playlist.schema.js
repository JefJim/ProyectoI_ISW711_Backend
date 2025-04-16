module.exports = `
  type Playlist {
    _id: ID!
    name: String!
    associatedProfiles: [RestrictedUser]
    createdBy: User!
    videos: [Video!]!
  }

  extend type Query {
    playlistsByCreator(parentUser: ID!): [Playlist]
  }
`;
