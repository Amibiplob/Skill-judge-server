const express = require("express");

const quiz = express.Router();
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
		const quizCollection = database.collection("quiz");
		const totalQuizCollection = database.collection("totalQuiz");
    const quizSavedCollection = database.collection("quizSaved");
    quiz.get("/", async (req, res) => {
      const query = {};
      const cursor = quizCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });


  quiz.get("/:name", async (req, res) => {
    const name = req.params.name;
    const query = { name: name };
    const result = await totalQuizCollection.find(query).toArray();
    res.send(result);
  });


	quiz.post("/quiz", async (req, res) => {
    const addQuiz = req.body;
    const result = await quizCollection.insertOne(addQuiz);
    res.send(result);
  });


















  } finally {
  }
}
run().catch(console.dir);

/////////END////////////

module.exports = quiz;
