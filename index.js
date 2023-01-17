const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgq11wr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("Skill-judge");
    const qnaCollection = database.collection("qna");




    
    app.get("/qnasingle", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };

      const result = await qnaCollection.findOne(query);

      res.send(result);
    });






    app.get("/qna", async (req, res) => {
      const query = {};

      const cursor = qnaCollection.find(query);

      const result = await cursor.toArray();

      res.send(result);
    });









    app.post("qna", async (req, res) => {
      const qna = req.body;
      const result = await qnaCollection.insertOne(qna);

      res.send(result);
    });






  } finally {
  }
}

run().catch(console.dir);






app.get("/", (req, res) => {
  res.send("server is working");
});



app.listen(port, () => {
  console.log("server is working", port);
});
