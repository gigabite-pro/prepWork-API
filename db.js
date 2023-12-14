const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


try {
    client.connect()
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));
} finally {
    client.close();
}

module.exports = {client};