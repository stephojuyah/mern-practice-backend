const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone_no: String,
    gender : String,
    role : {type: String, default: "patient"},
    img_url: String,
    img_id: String,
    is_deleted: {type: Boolean, default: false},
}, {collection: 'patient'});

const model = mongoose.model('Patient', patientSchema);
module.exports = model;