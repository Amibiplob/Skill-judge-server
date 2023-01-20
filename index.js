const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skill-judge.old6dyc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


async function run() {
  try {
    const database = client.db("Skill-judge");
    const qnaCollection = database.collection("qna");




    
    app.get("/qnasingle", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };

      const result = await qnaCollection.findOne(query);

      res.send([result]);
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
