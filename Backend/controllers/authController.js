const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer= require('nodemailer');
const crypto = require('crypto');
// Registro de usuario
exports.register = async (req, res) => {
    const { email, password, phone, pin, name, lastName, country, birthDate } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }


         // Creacion del token de verificación
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Crear un nuevo usuario
        const user = new User({ 
            email, 
            password, 
            phone, 
            pin, 
            name, 
            lastName, 
            country, 
            birthDate,
            status: 'pendiente',
            verificationToken
        
        });


        await user.save();



    const verificationLink = `http://localhost:3000/verify?token=${verificationToken}`; 
    //codigo para el verificacion del email
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER, // Usa variables de entorno
          pass: process.env.EMAIL_PASS,
        },
      });
  
      await transporter.sendMail({
        from: '"Tu App" <no-reply@tuapp.com>',
        to: email,
        subject: 'Verifica tu cuenta',
        html: `
          <h3>¡Hola ${name}!</h3>
          <p>Gracias por registrarte. Por favor verifica tu cuenta haciendo clic en el siguiente enlace:</p>
          <a href="${verificationLink}">${verificationLink}</a>
        `,
      });
    



        res.status(201).json({ message: 'Usuario registrado exitosamente. Verifica tu email para activar tu cuenta...' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.verifyUser = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send('Token inválido o expirado');
    }

    user.status = 'activo';
    user.verificationToken = undefined;
    await user.save();

    // Redirige al login 
    res.redirect('http://localhost:5500/login.html');
  } catch (error) {
    res.status(500).send('Error al verificar la cuenta');
  }
};



// Login de usuario
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }
        console.log(user);
        //verifica que el ususario este activo , en caso contrario no ingresa
        if (user.status !== 'activo') {
            return res.status(403).json({ error: 'Tu cuenta aún no está verificada. Revisa tu email.' });
          }
          

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // Generar el token JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const Id = user._id;
        res.json({ token, Id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};