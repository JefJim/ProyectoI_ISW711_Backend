const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');

// configure Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// google authentication
exports.googleAuth = async (req, res) => {
    const { tokenId } = req.body;

    try {
        // Verify the token ID
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name, sub: googleId } = payload;

        // find existing user by email or googleId
        let user = await User.findOne({ 
            $or: [
                { email },
                { googleId }
            ]
        });

        if (user) {
            // user found, check if it's a Google user
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }

            // generate token JWT
            const token = generateToken(user);

            return res.status(200).json({
                success: true,
                token,
                user: formatUserResponse(user),
                requiresAdditionalInfo: false
            });
        }

        // create temporary user
        const tempUser = {
            email,
            name: given_name,
            lastName: family_name || '',
            googleId,
            status: 'pendiente',
            requiresAdditionalInfo: true
        };

        // generate token temporal
        const tempToken = jwt.sign(
            { tempUser },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );

        res.status(200).json({
            success: true,
            tempToken,
            requiresAdditionalInfo: true,
            userData: tempUser
        });

    } catch (error) {
        console.error('Error en autenticación con Google:', error);
        res.status(500).json({
            error: 'Error en autenticación con Google',
            message: error.message
        });
    }
};

// complete google registration
exports.completeGoogleRegistration = async (req, res) => {
    const { tempToken, phone, pin, country, birthDate } = req.body;

    try {
        // verify token temporal
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        const { tempUser } = decoded;

        // validate required fields
        if (!phone || !pin || !country || !birthDate) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // validate pin
        if (!/^\d{6}$/.test(pin)) {
            return res.status(400).json({ error: 'El PIN debe tener 6 dígitos' });
        }

        // validate birthDate
        const age = Math.floor((new Date() - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 365));
        if (age < 18) {
            return res.status(400).json({ error: 'Debes tener al menos 18 años' });
        }

        // create user
        const hashedPin = await bcrypt.hash(pin, 10);
        const user = new User({
            ...tempUser,
            phone,
            pin: hashedPin,
            country,
            birthDate,
            status: 'activo',
            requiresAdditionalInfo: false,
            password: crypto.randomBytes(16).toString('hex') // random password
        });

        await user.save();

        // generate token JWT
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('Error al completar registro con Google:', error);
        res.status(500).json({
            error: 'Error al completar registro',
            message: error.message
        });
    }
};

// auxiliary functions
function generateToken(user) {
    return jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

function formatUserResponse(user) {
    return {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
    };
}