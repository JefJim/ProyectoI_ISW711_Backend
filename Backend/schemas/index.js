const fs = require('fs');
const path = require('path');

// read all files .schema.js
const schemaFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.schema.js') && file !== 'index.js');

let typeDefs = `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// combine all schemas into one string
schemaFiles.forEach(file => {
  const schemaContent = require(path.join(__dirname, file));
  typeDefs += '\n' + schemaContent;
});

module.exports = typeDefs;
