// additem.js

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
let productCollection;

app.use(express.json());
app.use(cors());

async function connectToMongoDB() {
    const client = new MongoClient(mongoUrl);
    try {
        await client.connect();
        console.log('Connected successfully to server');
        db = client.db(dbName);
        userCollection = db.collection('users');
        productCollection = db.collection('products');
    } catch (err) {
        console.error(err);
    }
}

connectToMongoDB();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, secretKey);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
}

app.post('/add-product', authenticateToken, async (req, res) => {
    const { item, itemId, itemPassword, email, password } = req.body;

    try {
        const user = await userCollection.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const newProduct = {
            item,
            itemId,
            itemPassword,
            addedBy: email,
        };

        await productCollection.insertOne(newProduct);
        res.status(200).json({ message: 'Product added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = app;
