const dotenv = require('dotenv');
dotenv.config(); // Esto carga el archivo .env
const mongoose = require('mongoose');
const bodyParser = require('body-parser');  // Requerir body-parser
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const videoRoutes = require('./routes/videoRoutes');
const cors = require('cors');


console.log(process.env.MONGO_URI); // Verifica si MONGO_URI está correctamente cargado

const app = express();
app.use(bodyParser.json({ limit: '50mb' })); // Puedes ajustar el valor según sea necesario
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});




// Conexión a MongoDB
connectDB();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/videos', videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));