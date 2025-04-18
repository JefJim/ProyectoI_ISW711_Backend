const User = require('../models/User');
const VerificationCode = require('../models/verficationCode');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer= require('nodemailer');
const crypto = require('crypto');

const { sendVerificationCode } = require('../services/twilioService');

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
    res.redirect('http://localhost:5500/verify.html?status=success');

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
        //verifica que el ususario este activo , en caso contrario no ingresa
        if (user.status !== 'activo') {
            return res.status(403).json({ error: 'Tu cuenta aún no está verificada. Revisa tu email.' });
          }
          

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }
        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await VerificationCode.create({ 
            userId: user._id, 
            code 
        });

        // Enviar SMS (usando el servicio de Twilio)
        await sendVerificationCode(user.phone, code);
        res.json({ 
            requires2FA: true,
            message: 'Código de verificación enviado a tu teléfono' 
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            error: 'Error en el servidor. Intenta nuevamente más tarde.' 
        });
    }
};

// método para verificar el código de verificación de 2FA/mensajería de texto
exports.verifyCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        // 1. Validar usuario
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

        // 2. Buscar código (sin filtro de fecha)
        const verifyCode = await VerificationCode.findOne({
            userId: user._id,
            code: code.trim()
        });

        // 3. Validar expiración
        if (!verifyCode || verifyCode.expiresAt < new Date()) {
            if (verifyCode) await VerificationCode.deleteOne({ _id: verifyCode._id });
            return res.status(400).json({ error: 'Código expirado. Solicita uno nuevo.' });
        }

        // 5. Eliminar código usado
        await VerificationCode.deleteOne({ _id: verifyCode._id });

        // 6. Generar JWT y responder
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ 
            message: 'Código verificado exitosamente', 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error en verifyCode:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};