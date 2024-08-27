//view.js

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'mydatabase';

let db;
let productCollection;

app.use(cors());
app.use(express.json());

async function connectToMongoDB() {
    const client = new MongoClient(mongoUrl);
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB server');
        db = client.db(dbName);
        productCollection = db.collection('products');
    } catch (err) {
        console.error(err);
    }
}

connectToMongoDB();

app.get('/products', async (req, res) => {
    try {
        const products = await productCollection.find({}).toArray();
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = app;
