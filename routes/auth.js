const express = require('express');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const route = express.Router();

require('dotenv').config();

// const uploader = require("../utils/multer");

// const { decryptObject, encryptObject } = require('../encrypt');

const User = require('../models/user');

const { sendPasswordReset } = require('../utils/nodemailer')


route.post('/register', async (req, res) => {
    const { password, name, email, phone_no} = req.body;

    if (!password || !name || !email || !phone_no) {
        return res.status(400).send({ "status": "error", "msg": "All field must be filled" });
    }
    try {
        const found = await User.findOne({ email: email }, { email: 1, _id: 0 }).lean();
        if (found)
            return res.status(400).send({ status: 'error', msg: `User with this email already exists` });
            
        const user = new User();
        user.name = name;
        user.password = await bcrypt.hash(password, 10);
        user.phone_no = phone_no;
        user.email = email;
       
        await user.save();

        return res.status(200).send({status: 'ok', msg: 'Registration successful', user});

    } catch (error) {
        console.error(error);
        res.status(500).send({ "status": "some error occurred", "msg": error.message });
    }
});



route.post('/login', async (req, res) => {
    const { email, password } = req.body; // Destructuring the request body

    if (!email || !password) {
        return res.status(400).send({ status: 'error', msg: 'all fields must be filled' });
    }
    try {
        const user = await User.findOne({ email } ,{ password: 1, name: 1, email: 1, _id: 1, is_deleted: 1, is_online: 1 });
        
        if (!user || user == undefined) {
            return res.status(400).send({ status: 'error', msg: 'User does not exist' });
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
            
            res.status(200).send({ status: 'Success', msg: 'You have successfully logged in', user, token });
        } else {
            res.status(400).send({ status: 'error', msg: 'incorrect password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "some error occurred", msg: error.message });
    }
});


route.post('/request_reset', async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).send({ status: 'error', msg: 'Email is required' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send({ status: 'error', msg: 'User not found' });

        // generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        
        // generate token valid for 10 mins
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });
        
        user.resetOtp = otp;
        user.resetToken = token;
        user.resetTokenExpires = Date.now() + 10 * 60 * 1000;
        
        await user.save(); 
        

        sendPasswordReset(email, otp);

        return res.status(200).send({ status: 'ok', msg: `A reset OTP has been sent to ${email}`, token });

    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', msg: error.message });
    }
});


route.post('/reset_password', async (req, res) => {
    const { email, token, otp, newPassword } = req.body;

    if (!email || !token || !otp || !newPassword) {
        return res.status(400).send({ status: 'error', msg: 'All fields are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || user.resetOtp !== otp || user.resetToken !== token || Date.now() > user.resetTokenExpires) {
            return res.status(401).send({ status: 'error', msg: 'Invalid or expired token/OTP' });
        }

        // verify token
        jwt.verify(token, process.env.JWT_SECRET);

        // hash and update new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = undefined;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        res.status(200).send({ status: 'ok', msg: 'Password reset successful' });
    } catch (error) {
        res.status(500).send({ status: 'error', msg: error.message });
    }
});



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

        res.status(200).send({ 'status': 'success', 'msg': 'You have successfully logged out' });       
    } catch (error) {
        console.error(error);
        if(error.name === 'JsonWebTokenError') {
            return res.status(400).send({status: 'error', msg: 'Token verification failed'});
        }
        // Sending error response if something goes wrong
        res.status(500).send({ "status": "some error occurred", "msg": error.message });
    }
});




module.exports = route