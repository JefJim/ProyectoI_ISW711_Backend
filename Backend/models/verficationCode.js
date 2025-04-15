const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  code: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutos en futuro de expiración
  }
});

// Índice para limpieza automática de códigos expirados
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 540 }); // Borra el documento/codigo después de 9 minutos (540 segundos)

module.exports = mongoose.model('verificationCode', verificationCodeSchema);