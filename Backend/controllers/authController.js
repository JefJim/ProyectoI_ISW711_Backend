const User = require('../models/User');
const VerificationCode = require('../models/verficationCode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');
const { sendVerificationCode } = require('../services/twilioService');
const { sendVerificationEmail } = require('../services/emailService');

// Registro de usuario
exports.register = async (req, res) => {
    const { email, password, phone, pin, name, lastName, country, birthDate } = req.body;

    try {
        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }

        // Creación del token de verificación
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Crear un nuevo usuario
        const user = new User({
            email,
            password, // El modelo se encarga del hashing
            phone,
            pin, // El modelo debería hashear esto también
            name,
            lastName,
            country,
            birthDate,
            status: 'pendiente',
            verificationToken
        });

        await user.save();
        await sendVerificationEmail(email, name, verificationToken);
       
        res.status(201).json({ 
            message: 'Usuario registrado exitosamente. Verifica tu email para activar tu cuenta.',
            data: {
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor al registrar usuario' });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token de verificación requerido' });
        }

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
        }

        user.status = 'activo';
        user.verificationToken = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: 'Cuenta verificada correctamente' });

    } catch (error) {
        console.error('Error en verificación:', error);
        return res.status(500).json({ success: false, message: 'Error al verificar la cuenta' });
    }
};


// Login de usuario
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar el usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar estado de la cuenta
        if (user.status !== 'activo') {
            return res.status(403).json({
                error: 'Cuenta no verificada',
                message: 'Revisa tu email para verificar tu cuenta o contacta al soporte.'
            });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos de expiración

        await VerificationCode.create({
            userId: user._id,
            code,
            expiresAt
        });

        // Enviar SMS (usando el servicio de Twilio)
        await sendVerificationCode(user.phone, code);

        res.status(200).json({
            success: true,
            requires2FA: true,
            message: 'Código de verificación enviado a tu teléfono',
            data: {
                email: user.email,
                userId: user._id
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error en el servidor',
            message: 'Intenta nuevamente más tarde.'
        });
    }
};

// Verificación de código 2FA
exports.verifyCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        // Validación básica
        if (!email || !code) {
            return res.status(400).json({ error: 'Email y código son requeridos' });
        }

        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Buscar código
        const verifyCode = await VerificationCode.findOne({
            userId: user._id,
            code: code.trim()
        });

        // Validar código
        if (!verifyCode) {
            return res.status(401).json({ error: 'Código incorrecto' });
        }

        // Validar expiración
        if (verifyCode.expiresAt < new Date()) {
            await VerificationCode.deleteOne({ _id: verifyCode._id });
            return res.status(401).json({ error: 'Código expirado. Solicita uno nuevo.' });
        }

        // Eliminar código usado
        await VerificationCode.deleteOne({ _id: verifyCode._id });

        // Generar JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            message: 'Autenticación exitosa',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error en verifyCode:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo completar la verificación'
        });
    }
};