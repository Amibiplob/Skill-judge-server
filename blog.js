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
    const blogCollection = database.collection("blog");

    blog.get("/", async (req, res) => {
      const query = {};
      const cursor = blogCollection.find(query);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    blog.post("/", async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

	blog.get("/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await blogCollection.findOne(query);
    res.send([result]);
  });


    
  } finally {
  }
}
run().catch(console.dir);

/////////END////////////

module.exports = blog;
