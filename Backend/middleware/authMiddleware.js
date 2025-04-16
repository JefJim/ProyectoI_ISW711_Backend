const jwt = require('jsonwebtoken');

//function to authenticate users in REST API
exports.authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido' });
    }
};
// function for GraphQL
exports.getUserFromToken = (token) => {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        return { userId: decoded.userId }; 
    } catch (error) {
        return null;
    }
};