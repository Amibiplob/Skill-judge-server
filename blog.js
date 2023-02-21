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

    blog.patch("/comment", async (req, res) => {
      const comment = req.body;
      // create a filter for a movie to update
      const filter = { _id: ObjectId(comment.blogId) };
      // this option instructs the method to create a document if no documents match the filter
      const options = { upsert: true };
      // create a document that sets the plot of the movie

      const oldComment = await blogCollection.findOne(filter);

      const updateDoc = {
        $set: {
          comment: [
            ...oldComment.comment,
            {
              userId: comment.userId,
              name: comment.name,
              userImage: comment.userImage,
              comment: comment.comment,
            },
          ],
        },
      };
      const result = await blogCollection.updateOne(filter, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    blog.delete("/", async (req, res) => {
      const id = req.query.id;
      // Query for a movie that has title "Annie Hall"
      const query = { _id: ObjectId(id) };
      const result = await blogCollection.comment.deleteOne(query);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
    });
  } finally {
  }
}
run().catch(console.dir);

/////////END////////////

module.exports = blog;
