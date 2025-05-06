const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//schema to user model 
const userSchema = new mongoose.Schema({
  //validation to email
  email: { type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid format of the email" },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  pin: {
    type: String, required: true,
    validate: {
      validator: function (pin) {
        return /^\d{6}$/.test(pin.toString());//validates if pin has 6 digits
      },
      message: "You must enter 6 digit number",
    },
  },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String },
  birthDate: {
    type: Date, required: true,
    validate: {
      validator: function (date) {
        // Validates if the user is 18 years or older
        const age = Math.floor(
          (new Date() - new Date(date)) / (1000 * 60 * 60 * 24 * 365)
        );
        return age >= 18;
      },
      message: "You must be 18 years old",
    },
  },
  status: {
    type: String,
    enum: ['pendiente', 'activo'],
    default: 'pendiente' //por defecto va a aparecer en pendiente cuando el user se registraa
  },
  verificationToken:{type: String}

});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
//export schema
module.exports = mongoose.model('User', userSchema);