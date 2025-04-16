module.exports = `
  type RestrictedUser {
    _id: ID!
    fullName: String!
    pin: String!
    avatar: String!
    parentUser: ID!
  }

  extend type Query {
    restrictedUserByFather(parentUser: ID!): [RestrictedUser!]!
  }
`;
