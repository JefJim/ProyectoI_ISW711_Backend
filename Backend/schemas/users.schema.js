module.exports = `
  type User {
    _id: ID
    email: String
    password: String
    phone: String
    pin: String
    name: String
    lastName: String
    country: String
    birthDate: String
    status: String
    restrictedUsers: [RestrictedUser!]! # Relación con RestrictedUser
  }

  extend type Query {
    restrictedUserByFather(parentUser: ID!): [RestrictedUser!]! # Consulta de restricted users por parentUser
  }
`;
