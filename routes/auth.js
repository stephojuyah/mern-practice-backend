const express = require('express');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const route = express.Router();

require('dotenv').config();

// const uploader = require("../utils/multer");

// const { decryptObject, encryptObject } = require('../encrypt');

const User = require('../models/user');

const {sendPasswordReset, sendOTP} = require('../utils/nodemailer')


route.post('/register', async (req, res) => {
    const { password, name, email, phone_no} = req.body;

    if (!password || !name || !email || !phone_no) {
        return res.status(400).send({ "status": "error", "msg": "All field must be filled" });
    }
    try {
        const found = await User.findOne({ username: username }, { username: 1, _id: 0 }).lean();
        if (found)
            return res.status(400).send({ status: 'error', msg: `User with this username: ${username} already exists` });
            
        const user = new User();
        user.name = name;
        user.password = await bcrypt.hash(password, 10);
        user.phone_no = phone_no;
        user.email = email;
       
        await user.save();

        return res.status(200).send({status: 'ok', msg: 'success', user});

    } catch (error) {
        console.error(error);
        res.status(500).send({ "status": "some error occurred", "msg": error.message });
    }
});



route.post('/login', async (req, res) => {
    const { email, password } = req.body; // Destructuring the request body

    if (!email || !password) {
        return res.status(400).send({ 'status': 'error', 'msg': 'all fields must be filled' });
    }
    try {
        // check if user with that email exists in the database
        const user = await User.findOne({ email }, { password: 1, username: 1, email: 1, _id: 1, is_deleted: 1, is_online: 1 });
        // if user is not found, return error
        if (!user) {
            return res.status(400).send({ 'status': 'error', 'msg': 'Incorrect email' });
        }


        // check if password is correct
        if (await bcrypt.compare(password, user.password)) {
            // generate jwt token
            const token = jwt.sign({
                _id: user._id,
                email: user.email,
                name: user.name
            }, process.env.JWT_SECRET, 
            {expiresIn: '30m'}
        );

            user.is_online = true;
            await user.save();
            
            res.status(200).send({ 'status': 'Success', 'msg': 'You have successfully logged in', user, token });
        } else {
            res.status(400).send({ 'status': 'error', 'msg': 'incorrect email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ "status": "some error occurred", "msg": error.message });
    }
});


// forgot password endpoint
route.post('/forgot_password', async (req,res)=>{
    const {email, resetPasswordCode} = req.body;

    if (!email || !resetPasswordCode){
        return res.status(400).send({"status": "Error", "msg": "all fields must be filled"})
    }
    try{
        // check if user with email passed exist
        const user = await User.findOne({email:email})

        // send reset password to email
        sendPasswordReset(email, resetPasswordCode)

        return res.status(200).send({status: "success", msg: "Reset password request has been sent to " + email})

        
    } catch (error) {
        console.error(error);
        // Sending error response if something goes wrong
        res.status(500).send({ "status": "some error occurred", "msg": error.message });
    }

     
})

// endpont to logout
route.post('/logout', async (req, res) => {
    const { token } = req.body; 

    if (!token) {
        return res.status(400).send({ 'status': 'Error', 'msg': 'all fields must be filled' });
    }

    try {
        // token authentication
        const user = jwt.verify(token, process.env.JWT_SECRET);

        // update user document online status
        await User.updateOne({_id: user._id}, {is_online: false});

        res.status(200).send({ 'status': 'success', 'msg': 'success' });       
    } catch (error) {
        console.error(error);
        if(error.name === 'JsonWebTokenError') {
            return res.status(400).send({status: 'error', msg: 'Token verification failed'});
        }
        // Sending error response if something goes wrong
        res.status(500).send({ "status": "some error occurred", "msg": error.message });
    }
});


 // endpoint to send otp
route.post('/send_otp', async (req, res) => {
    const {token, otp, email } = req.body; // Destructuring the request body

    // Checking if any required field is missing
    if (!token || !otp || !email ) {
        return res.status(400).send({ status: "error", msg: "all fields must be filled" });
    }

    try {
        // token verification
        jwt.verify(token, process.env.JWT_SECRET);

        // send otp
        sendOTP(email, otp);

        return res.status(200).send({status: 'ok', msg: 'success'});

    } catch (error) {
        console.error(error);
        // Sending error response if something goes wrong
        res.status(500).send({ status: "some error occurred", msg: error.message });
    }
});



module.exports = route