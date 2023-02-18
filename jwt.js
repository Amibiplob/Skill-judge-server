const express = require("express");

const jsonWebToken = require('jsonwebtoken');
const jwt = express.Router();
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skill-judge.old6dyc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

/////////START//////////
async function run() {
  try {
    const database = client.db("Skill-judge");
    const userCollection = database.collection("user");

    //Generate a jwt token
    jwt.get('/', async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jsonWebToken.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' });
        return res.send({ accessToken: token })
      }
      res.status(403).send({ accessToken: '' })
    })











  } finally {
  }
}
run().catch(console.dir);

/////////END////////////

module.exports = jwt;
