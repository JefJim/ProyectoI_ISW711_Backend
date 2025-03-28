const RestrictedUser = require('../models/RestrictedUser');
const User = require('../models/User');

// Create a restricted user
exports.createRestrictedUser = async (req, res) => {
    const { fullName, pin, avatar, parentUser } = req.body;
    try {
        const restrictedUser = new RestrictedUser({ fullName, pin, avatar, parentUser });
        await restrictedUser.save();

        res.status(201).json({ message: 'Usuario restringido creado exitosamente', restrictedUser });
    } catch (error) {
        console.error('Error al guardar el usuario restringido:', error);  // Log del error
        res.status(500).json({ error: error.message });
    }
};
// Get all restricted users from the user
exports.getRestrictedUsers = async (req, res) => {
    try {
        // middleware has userID
        const parentUserId = req.user.userId; 
        // filter by id
        const restrictedUsers = await RestrictedUser.find({ parentUser: parentUserId });
        res.json(restrictedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getRestrictedUserById = async (req, res) => {
    const { id } = req.params;

    try {
        // Search for the restricted user by ID
        const restrictedUser = await RestrictedUser.findOne({ _id: id });

        // If no restricted user is found, return an error
        if (!restrictedUser) {
            console.log(error);  // Log error
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Return the restricted user
        res.json(restrictedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Verificar el PIN del usuario restringido antes de acceder
exports.verifyUserPin = async (req, res) => {
    try {
        const { id, pin } = req.body;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario restringido no encontrado' });
        }

        if (user.pin !== pin) {
            return res.status(401).json({ error: 'PIN incorrecto' });
        }

        res.json({ message: 'PIN correcto', userId: user._id });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
// Verificar el PIN del usuario restringido antes de acceder
exports.verifyRestrictedUserPin = async (req, res) => {
    try {
        const { id, pin } = req.body;
        const restrictedUser = await RestrictedUser.findById(id);

        if (!restrictedUser) {
            return res.status(404).json({ error: 'Usuario restringido no encontrado' });
        }

        if (restrictedUser.pin !== pin) {
            return res.status(401).json({ error: 'PIN incorrecto' });
        }

        res.json({ message: 'PIN correcto', userId: restrictedUser._id });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
// Update a restricted user
exports.updateRestrictedUser = async (req, res) => {
    const { id } = req.params;
    const { fullName, pin, avatar } = req.body;

    try {
        const restrictedUser = await RestrictedUser.findByIdAndUpdate(
            id,
            { fullName, pin, avatar },
            { new: true }
        );

        if (!restrictedUser) {
            return res.status(404).json({ error: 'Usuario restringido no encontrado' });
        }

        res.json({ message: 'Usuario restringido actualizado exitosamente', restrictedUser });
    } catch (error) {
        console.error('Error al actualizar el usuario restringido:', error);  // Log error
        res.status(500).json({ error: error.message });
    }
};

// delete a restricted user
exports.deleteRestrictedUser = async (req, res) => {
    const { id } = req.params;

    try {
        const restrictedUser = await RestrictedUser.findByIdAndDelete(id);

        if (!restrictedUser) {
            return res.status(404).json({ error: 'Usuario restringido no encontrado' });
        }

        res.json({ message: 'Usuario restringido eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};