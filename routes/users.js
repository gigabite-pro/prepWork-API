const router = require('express').Router();
const {client} = require('../db');
const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const db = client.db('prepWork');
const collection = db.collection('Users');

router.post('/register', async (req, res) => {
    const {email, username, password} = req.body;

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = {email, username, password: hashedPassword};
    const result = await collection.insertOne(user);

    if (result.insertedCount === 0) {
        res.json({
            status: false,
            error: 'Error creating user',
        });
    }

    // Create and assign a token
    const token = jwt.sign({_id: result.insertedId}, process.env.TOKEN_SECRET, {expiresIn: '2h'});
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
            const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {expiresIn: '2h'});
            res.json({
                status: true,
                token: token,
            });
        } else {
            res.json({
                status: false,
                error: 'Incorrect password',
            });
        }
    } else {
        res.json({
            status: false,
            error: 'User not found',
        });
    }
});

router.post('/verify', async (req, res) => {
    const {token} = req.body;

    try {
        const payload = jwt.verify(token, process.env.TOKEN_SECRET);
        res.json({
            status: true,
            message: 'Token is valid',
        });
    } catch (e) {
        console.log(e);
        res.json({
            status: false,
            error: 'Invalid token',
        });
    }
});

router.post('/forgot-password', async (req, res) => {
    const {email} = req.body;

    //Mail Config
    const transporter = nodemailer.createTransport({
        service: `${process.env.EMAIL_SERVICE}`,
        auth: {
            user: `${process.env.EMAIL_USER}`,
            pass: `${process.env.EMAIL_PASS}`
        }
    });

    // Get User
    const user = await collection.findOne({email: email});

    if (user) {

        // Generate Token
        const secret = process.env.TOKEN_SECRET + user.password;
        const payload = {
            email: user.email,
            id: user._id,
        };

        const token = jwt.sign(payload, secret, {expiresIn: '10m'});
        const url = `http://localhost:3000/users/reset-password/${user._id}/${token}`;

        var mailOptions = {
            from: `PrepWork Support<${process.env.EMAIL_USER}>`,
            to: email,
            subject: `PrepWork - Reset Your Password`,
            html: `<p>
            Please click on the link below to reset your password:
            <br>
            <a href="${url}">Reset Password</a>
            <br><br>
            If the link doesn't work, copy and paste the following link in your browser:
            <br>
            ${url}
            </p>`
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                res.json({
                    status: false,
                    error: 'Error sending email',
                });
            } else {
                res.json({
                    status: true,
                    message: 'Email sent',
                });
            }
        });
    } else {
        res.json({
            status: false,
            error: 'User not found',
        });
    }
});

router.get('/reset-password/:id/:token', async (req, res) => {
    const {id, token} = req.params;

    const objectId = new ObjectId(`${id}`);
    // Get User
    const user = await collection.findOne({_id: objectId});

    if(user) {
        const secret = process.env.TOKEN_SECRET + user.password;
        try {
            const payload = jwt.verify(token, secret);
            res.render('reset-password', {id: id, token: token, email: user.email});
        } catch (e) {
            console.log(e)
            res.render('reset-password-status', {status: 'invalid'})
        }
    } else {

    }
});

router.post('/reset-password/:id/:token', async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    // Get User
    const user = await collection.findOne({_id: new ObjectId(`${id}`)});

    if (user) {
        const secret = process.env.TOKEN_SECRET + user.password;
        try {
            const payload = jwt.verify(token, secret);
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await collection.updateOne({_id: new ObjectId(`${id}`)}, {$set: {password: hashedPassword}});
            if (result.modifiedCount === 0) {
                res.render('reset-password-status', {status: 'error'})
            }
            res.render('reset-password-status', {status: 'success'})
        } catch (e) {
            console.log(e)
            res.render('reset-password-status', {status: 'error'})
        }
    }
});

module.exports = router;