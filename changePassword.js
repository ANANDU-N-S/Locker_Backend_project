const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'mydatabase';
const secretKey = '##digi_talco_locker_server_admin_protected___$%#@!OO_0_keys';

let db;
let userCollection;
let otpCollection;

app.use(express.json());
app.use(cors());

async function connectToMongoDB() {
    const client = new MongoClient(mongoUrl);
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB server');
        db = client.db(dbName);
        userCollection = db.collection('users');
        otpCollection = db.collection('otps');
    } catch (err) {
        console.error(err);
    }
}

connectToMongoDB();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email id
        pass: process.env.EMAIL_PASS, // Your password
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Changing Email and Password',
        text: `Your OTP is ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP sent successfully');
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
}

app.post('/request-otp', async (req, res) => {
    const { newEmail } = req.body;

    try {
        const otp = generateOTP();
        await otpCollection.insertOne({ email: newEmail, otp, createdAt: new Date() });

        await sendOTP(newEmail, otp);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/change-password', async (req, res) => {
    const { oldEmail, oldPassword, newEmail, otp, newPassword, reenterPassword } = req.body;

    if (newPassword !== reenterPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const user = await userCollection.findOne({ email: oldEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const otpRecord = await otpCollection.findOne({ email: newEmail, otp });
        if (!otpRecord) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userCollection.updateOne(
            { email: oldEmail },
            { $set: { email: newEmail, password: hashedPassword } }
        );

        await otpCollection.deleteOne({ email: newEmail, otp });

        res.status(200).json({ message: 'Email and password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = app;
