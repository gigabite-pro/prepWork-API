const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { isAuthorized } = require('./config/isAuthorized');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
app.use('/users', require('./routes/users'));
app.use('/answers', isAuthorized, require('./routes/answers'));

app.get('/', async (req, res) => {
    res.send("working")
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
