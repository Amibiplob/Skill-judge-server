const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgq11wr.mongodb.net/?retryWrites=true&w=majority`;


 
const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("Skill-Judge");
    const qna = database.collection("qna");
   
    



    
app.get("qna",async(req,res)=>{



  
})

    
app.post("qna",async(req,res)=>{




})









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
