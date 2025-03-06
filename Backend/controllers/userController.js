const RestrictedUser = require('../models/RestrictedUser');

// Crear un usuario restringido
exports.createRestrictedUser = async (req, res) => {
    const { fullName, pin, avatar, parentUser } = req.body;

    console.log('Datos recibidos:', { fullName, pin, avatar, parentUser });  // Log de los datos recibidos

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
// Obtener todos los usuarios restringidos
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
        // Buscar un solo usuario por su _id
        const restrictedUser = await RestrictedUser.findOne({ _id: id });

        // Si no se encuentra el usuario, devolver un error 404
        if (!restrictedUser) {
            console.log(error);  // Log de error
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Devolver el usuario encontrado
        res.json(restrictedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Actualizar un usuario restringido
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
        console.error('Error al actualizar el usuario restringido:', error);  // Log del error
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un usuario restringido
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