const RestrictedUser = require('../models/RestrictedUser');


// Create a restricted user
exports.createRestrictedUser = async (req, res) => {
    const { fullName, pin, avatar, parentUser } = req.body;
    try {
        const restrictedUser = new RestrictedUser({ fullName, pin, avatar, parentUser });
        await restrictedUser.save();

        console.log('Usuario restringido guardado:', restrictedUser);  // Log del usuario guardado

        res.status(201).json({ message: 'Usuario restringido creado exitosamente', restrictedUser });
    } catch (error) {
        console.error('Error al guardar el usuario restringido:', error);  // Log del error
        res.status(500).json({ error: error.message });
    }
};
// Get all restricted users
exports.getRestrictedUsers = async (req, res) => {

    const { id } = req.params;
    try {
        const restrictedUsers = await RestrictedUser.find({ id });
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