const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql'); // Middleware GraphQL
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const { getUserFromToken } = require('./middleware/authMiddleware');

// Rutas REST
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const videoRoutes = require('./routes/videoRoutes');



const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

// Logging de requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Conexión a MongoDB
connectDB();

// import schemas and resolvers for GraphQL
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./schemas'); 
const resolvers = require('./resolvers');
// buildSchema from typeDefs
const schema = makeExecutableSchema({ typeDefs, resolvers });

// graphql endpoint
app.use('/graphql', graphqlHTTP(req => ({
  schema,
  graphiql: true,
  context: {
    user: getUserFromToken(req.headers.authorization)
  }
})));

// rest API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/videos', videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor REST en http://localhost:${PORT}`);
  console.log(`Servidor GraphQL en http://localhost:${PORT}/graphql`);
});