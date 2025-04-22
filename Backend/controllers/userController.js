const RestrictedUser = require('../models/RestrictedUser');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Crear usuario restringido
exports.createRestrictedUser = async (req, res) => {
    const { fullName, pin, avatar } = req.body;
    const parentUser = req.user.userId;

    try {
        if (!fullName || !pin) {
            return res.status(400).json({ 
                error: 'Datos incompletos',
                message: 'Nombre completo y PIN son requeridos' 
            });
        }     
        
        const restrictedUser = new RestrictedUser({ 
            fullName, 
            pin,
            avatar, 
            parentUser 
        });

        await restrictedUser.save();

        res.status(201).json({ 
            success: true,
            message: 'Usuario restringido creado exitosamente', 
            data: {
                id: restrictedUser._id,
                fullName: restrictedUser.fullName,
                avatar: restrictedUser.avatar
            }
        });
    } catch (error) {
        console.error('Error al crear usuario restringido:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo crear el usuario restringido' 
        });
    }
};

// Obtener usuarios restringidos del usuario actual
exports.getRestrictedUsers = async (req, res) => {
    try {
        const restrictedUsers = await RestrictedUser.find({ 
            parentUser: req.user.userId 
        }).select('-pin -__v');

        res.status(200).json({ 
            success: true,
            count: restrictedUsers.length,
            data: restrictedUsers 
        });
    } catch (error) {
        console.error('Error al obtener usuarios restringidos:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los usuarios restringidos' 
        });
    }
};

// Verificar PIN de usuario principal (para acciones sensibles)
exports.verifyUserPin = async (req, res) => {
    const { pin } = req.body;
    const userId = req.user.userId;

    try {
        if (!pin) {
            return res.status(400).json({ 
                error: 'Datos incompletos',
                message: 'El PIN es requerido' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado',
                message: 'El usuario no existe' 
            });
        }

        // Verificación para PIN no hasheado (comparación directa)
        const isMatch = user.pin === pin;
        
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'PIN incorrecto',
                message: 'El PIN proporcionado no es válido' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'PIN verificado correctamente',
            data: {
                userId: user._id,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Error al verificar PIN de usuario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo verificar el PIN' 
        });
    }
};

// Verificar PIN de usuario restringido (para inicio de sesión del perfil restringido)
exports.verifyRestrictedUserPin = async (req, res) => {
    const { id, pin } = req.body;
    const parentUserId = req.user.userId;

    try {
        if (!id || !pin) {
            return res.status(400).json({ 
                error: 'Datos incompletos',
                message: 'ID de usuario y PIN son requeridos' 
            });
        }

        // Verificar que el usuario restringido pertenece al usuario principal
        const restrictedUser = await RestrictedUser.findOne({ 
            _id: id, 
            parentUser: parentUserId 
        });

        if (!restrictedUser) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado',
                message: 'El usuario restringido no existe o no tienes permisos' 
            });
        }

        // Comparar PIN hasheado
        const isMatch = pin === restrictedUser.pin;
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'PIN incorrecto',
                message: 'El PIN proporcionado no es válido' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'PIN de usuario restringido verificado correctamente',
            data: {
                userId: restrictedUser._id,
                fullName: restrictedUser.fullName,
                avatar: restrictedUser.avatar
            }
        });
    } catch (error) {
        console.error('Error al verificar PIN de usuario restringido:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo verificar el PIN del usuario restringido' 
        });
    }
};

// Obtener usuario restringido por ID
exports.getRestrictedUserById = async (req, res) => {
    const { id } = req.params;
    const parentUserId = req.user.userId;

    try {
        const restrictedUser = await RestrictedUser.findOne({ 
            _id: id, 
            parentUser: parentUserId 
        }).select('-__v');

        if (!restrictedUser) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Usuario restringido no encontrado o no tienes permisos' 
            });
        }
        console.log('Usuario restringido encontrado:', restrictedUser);
        res.status(200).json({ 
            success: true,
            data: restrictedUser 

        });
    } catch (error) {
        console.error('Error al obtener usuario restringido:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo obtener el usuario restringido' 
        });
    }
};

// Actualizar usuario restringido
exports.updateRestrictedUser = async (req, res) => {
    const { id } = req.params;
    const { fullName, pin, avatar } = req.body;
    const parentUserId = req.user.userId;

    try {
        const updateData = { fullName, avatar };
        
        // Solo actualizar el PIN si se proporciona
        if (pin) {
            updateData.pin = pin;
        }

        const restrictedUser = await RestrictedUser.findOneAndUpdate(
            { _id: id, parentUser: parentUserId },
            updateData,
            { new: true, runValidators: true }
        ).select('-pin -__v');

        if (!restrictedUser) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Usuario restringido no encontrado o no tienes permisos' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Usuario restringido actualizado exitosamente', 
            data: restrictedUser 
        });
    } catch (error) {
        console.error('Error al actualizar usuario restringido:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo actualizar el usuario restringido' 
        });
    }
};

// Eliminar usuario restringido
exports.deleteRestrictedUser = async (req, res) => {
    const { id } = req.params;
    const parentUserId = req.user.userId;

    try {
        const restrictedUser = await RestrictedUser.findOneAndDelete({ 
            _id: id, 
            parentUser: parentUserId 
        });

        if (!restrictedUser) {
            return res.status(404).json({ 
                error: 'No encontrado',
                message: 'Usuario restringido no encontrado o no tienes permisos' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Usuario restringido eliminado exitosamente',
            data: {
                id: restrictedUser._id,
                fullName: restrictedUser.fullName
            }
        });
    } catch (error) {
        console.error('Error al eliminar usuario restringido:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: 'No se pudo eliminar el usuario restringido' 
        });
    }
};