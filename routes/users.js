const router = require('express').Router();
const {client} = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = client.db('prepWork');
const collection = db.collection('Users');

router.post('/register', async (req, res) => {
    const {email, username, password} = req.body;

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = {email, username, password: hashedPassword};
    const result = await collection.insertOne(user);

    // Create and assign a token
    const token = jwt.sign({_id: result.insertedId}, process.env.TOKEN_SECRET, {expiresIn: '10h'});
    res.json({
        status: true,
        token: token,
    });
});

router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    // Get User
    const user = await collection.findOne({
        $or: [
            {username: username},
            {email: username},
        ]
    });
    if (user) {
        // Check Password
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            // Create and assign a token
            const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {expiresIn: '10h'});
            res.json({
                status: true,
                token: token,
            });
        } else {
            res.json({
                status: false,
                error: 'Invalid password',
            });
        }
    } else {
        res.json({
            status: false,
            error: 'User not found',
        });
    }
});

module.exports = router;