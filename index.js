const express = require('express');
const app = express();
const {client} = require('./db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    // const db = client.db('prepWork');
    // const collection1 = db.collection('Users');
    
    // const user = {name: "Chintu", age: 20};
    // const result = await collection1.insertOne(user);
    // console.log(result);
    res.send("done")
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
