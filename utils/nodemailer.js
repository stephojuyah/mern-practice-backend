const nodemailer = require('nodemailer');
require("dotenv").config();

const sendPasswordReset = (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your password reset OTP is: ${otp}`
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordReset };

