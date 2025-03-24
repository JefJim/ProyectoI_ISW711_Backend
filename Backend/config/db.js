const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Carga las variables de entorno desde un archivo .env
const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);// detiene la ejecucion si la conexion falla
    }
};

module.exports = connectDB;