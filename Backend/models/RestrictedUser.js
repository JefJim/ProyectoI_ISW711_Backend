const mongoose = require('mongoose');

const restrictedUserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    pin: { type: String, required: true },
    avatar: { type: String, required: true },
    parentUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
},
{
    optimisticConcurrency: true,
    timestamps: true

});

module.exports = mongoose.model('RestrictedUser', restrictedUserSchema);