module.exports = `
  type Video {
    _id: ID!
    name: String!
    url: String!
    description: String
    duration: String
    playlist: Playlist
  }

  extend type Query {
    videos: [Video]
    searchVideos(keyword: String!): [Video!]!
    playlistVideos(playlistId: ID!, userId: ID!): [Video] 
  }
`;