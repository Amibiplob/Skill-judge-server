const express = require("express");

const review = express.Router();
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
    const reviewCollection = database.collection("review");



    review.get("/", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    review.post("/", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });









  } finally {
  }
}
run().catch(console.dir);

/////////END////////////

module.exports = review;
