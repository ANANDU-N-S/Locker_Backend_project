//index.js

const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'mydatabase';
const secretKey = '##digi_talco_locker_server_admin_protected___$%#@!OO_0_keys';

let db;
let userCollection;

app.use(express.json());
app.use(cors());

async function connectToMongoDB() {
    const client = new MongoClient(mongoUrl);
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB server');
        db = client.db(dbName);
        userCollection = db.collection('users');
    } catch (err) {
        console.error(err);
    }
}

connectToMongoDB();

async function saveAdminUser() {
    const email = 'talcopresident@gmail.com';
    const password = 'Talco_digi_lock_@_2024';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await userCollection.findOne({ email });
    if (!existingUser) {
        await userCollection.insertOne({ email, password: hashedPassword });
        console.log('Admin user saved to the database');
    } else {
        console.log('Admin user already exists in the database');
    }
}

saveAdminUser();

function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, secretKey);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
}

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userCollection.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ email: user.email }, secretKey);
        res.status(200).json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = app;
