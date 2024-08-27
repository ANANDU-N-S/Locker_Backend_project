const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

async function sendOTP(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Changing Email and Password',
        text: `Your OTP is ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP sent successfully to', email);
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
}

module.exports = {
    sendOTP
};
