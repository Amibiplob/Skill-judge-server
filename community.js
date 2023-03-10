const express = require("express");

const community = express.Router();
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
    const communityPostCollection = database.collection("community");

    community.get("/posts", async (req, res) => {
      const query = {};
      const cursor = communityPostCollection.find(query);
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    community.post("/post", async (req, res) => {
      const post = req.body;
      const result = await communityPostCollection.insertOne(post);
      res.send(result);
    });

    community.put("/post/like", async (req, res) => {
      const info = req.body;
      const filter = { _id: ObjectId(info.postId) }
      const updatedDoc = {
        $push: {
          "likes": info.userId
        }
      }
      const result = await communityPostCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    community.put("/post/unlike", async (req, res) => {
      const info = req.body;
      const filter = { _id: ObjectId(info.postId) }
      const updatedDoc = {
        $pull: {
          "likes": info.userId
        }
      }
      const result = await communityPostCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    community.put("/post/comment", async (req, res) => {
      const info = req.body;
      const filter = { _id: ObjectId(info.postId) }
      const updatedDoc = {
        $push: {
          "comments": { userId: info.userId, userPhoto: info.userPhoto, userName: info.userName, comment: info.comment, date: info.date }
        }
      }
      const result = await communityPostCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })


    community.get("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await communityPostCollection.findOne(query);
      res.send([result]);
    });


  } finally {
  }
}
run().catch(console.dir);

/////////END////////////

module.exports = community;
