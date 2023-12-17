const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { isAuthorized } = require('./config/isAuthorized');

const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: [process.env.EXTENSION_ORIGIN, process.env.WEBWORK_ORIGIN],
};

// Middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.set('views', (__dirname + '/views'))

// Routes
app.use('/users', require('./routes/users'));
app.use('/answers', isAuthorized, require('./routes/answers'));

app.get('/', async (req, res) => {
    res.send("working")
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
