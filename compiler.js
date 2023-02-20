const express = require("express");

const compiler = express.Router();
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skill-judge.old6dyc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const { loadPyodide } = require("pyodide");
/////////START//////////
async function run() {
  try {
    const database = client.db("Skill-judge");
		const compilerResultCollection = database.collection("compilerResult");



compiler.post("/", async (req, res) => {
    let pyodide = await loadPyodide();
    let result = await pyodide.runPythonAsync(req.body.code);

    res.json(result);
  });

compiler.post("/py", async (req, res) => {
    let pyodide = await loadPyodide();
    let result = await pyodide.runPythonAsync(req.body.code);

    res.json(result);
  });

	compiler.post("/result", async (req, res) => {
    const body = req.body;
    const result = await compilerResultCollection.insertOne(body);
    res.send(result);
  });










    
  } finally {
  }
}
run().catch(console.dir);

/////////END////////////

module.exports = compiler;
