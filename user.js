const express = require("express");
const jsonWebToken = require('jsonwebtoken');

const user = express.Router();
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skill-judge.old6dyc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Function for verify jwt
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('unauthorized access');
  }
  const token = authHeader.split(' ')[1];

  jsonWebToken.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    req.decoded = decoded;
    next();
  })
}

/////////START//////////
async function run() {
  try {
    const database = client.db("Skill-judge");
    const userCollection = database.collection("user");


    //Create user
    user.post("/", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const alreadyExist = await userCollection.findOne(query);
      if (alreadyExist) {
        res.send(JSON.stringify({ message: "User already exists" }));
        return;
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });


    //getUser by email
    user.get("/", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });



    //update users information
    user.patch("/updateUser", verifyJWT, async (req, res) => {
      const userEmail = req.query.email;
      const filter = { email: userEmail };
      const options = { upsert: true };

      const updatedDoc = {
        $set: req.body
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });







  } finally {
  }
}
run().catch(console.dir);

/////////END////////////

module.exports = user;
