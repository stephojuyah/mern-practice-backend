const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone_no: String,
    password: String,
    is_online: {type: Boolean, default: true},
    is_deleted: {type: Boolean, default: false},
    resetOtp: String,
    resetToken: String,
    resetTokenExpires: Date,
}, {collection: 'users'});

const model = mongoose.model('User', userSchema);
module.exports = model;