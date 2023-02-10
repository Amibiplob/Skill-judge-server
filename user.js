const express = require("express");

const blog = express.Router();
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










    
  } finally {
  }
}
run().catch(console.dir);

/////////END////////////

module.exports = blog;
