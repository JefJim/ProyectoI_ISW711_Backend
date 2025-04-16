module.exports = `
  type Video {
    _id: ID!
    name: String
    url: String
    playlist: Playlist! # Asegúrate de que este campo esté definido
  }

  extend type Query {
    videos: [Video]
    searchVideos(keyword: String!): [Video!]!
  }
`;
