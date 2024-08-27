const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'mydatabase';

let db;
let userCollection;

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

router.post('/logout', async (req, res) => {
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

    // Clear any session or token information here (if applicable)

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
