const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { loadPyodide } = require("pyodide");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skill-judge.old6dyc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const database = client.db("Skill-judge");
    const questionCollection = database.collection("userquestionCollection");
    const servicesCollection = database.collection("services");
    const paymentsCollection = database.collection("payments");
    const topQuestionsCollection = database.collection("topquestions");
    const questionsCollection = database.collection("question");
    const userCollection = database.collection("user");
    const quizCollection = database.collection("quiz");
    const totalQuizCollection = database.collection("totalQuiz");
    // Question
    app.get("/qnasingle/:id", async (req, res) => {
      const id = req.params.id;
      // const query = { _id: ObjectId(id) };
      // const result = await questionCollection.findOne(query);
      // res.send([result]);
    });

    app.get("/qna", async (req, res) => {
      const query = {};
      const cursor = questionCollection.find(query);
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    // quiz
    app.get("/quiz", async (req, res) => {
      const query = {};
      const cursor = quizCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });


    app.get("/quiz/:name", async (req, res) => {
     const name = req.params.name;
     const query = { name: name };
     const result = await totalQuizCollection.find(query).toArray();
     res.send(result);
    }) 

    // Compiler
    app.post("/compiler", async (req, res) => {
      let pyodide = await loadPyodide();
      let result = await pyodide.runPythonAsync(req.body.code); 
      res.json(result);
    });  

    // partial search question
    app.get("/search-qna", async (req, res) => {
      try {
        let searchResult;
        if (req.query.searchQuery) {
          const cursor = questionCollection.find({
            $text: { $search: `\"${req.query.searchQuery}\"` },
          });
          searchResult = await cursor.toArray();
        } else {
          searchResult = await questionCollection.find({}).toArray();
        }
        res.send(searchResult);
      } catch (error) {
        res.status(500).json({ message: "something went wrong!" });
      }
    });


    //GetUser by email
    app.get('/user', async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const users = await userCollection.find(query).toArray();
      res.send(users);
    })

    /*---- Afzal working here ----*/ 
    // Get All users
    app.get('/all-users', async(req, res) => {
      const query = {}
      const allUsers = await userCollection.find(query).toArray();
      res.send(allUsers)
    })
    // Delete user
    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id
      const filter = {_id: ObjectId(id)} 
      const user = await userCollection.deleteOne(filter)
      res.send(user)
    })

    //Create user
    app.post('/user', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const alreadyExist = await userCollection.findOne(query);
      if(alreadyExist){
         return;
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    // sourav code start here 
    app.post("/send-question", async (req, res) => {
      const question = req.body;
      const result = await questionCollection.insertOne(question);
      res.send({
        data: result,
        message: "Your Question Send Succesfully",
      });
    });
    app.post("/add-problem", async (req, res) => {
      const problem = req.body;
      const result = await problemCollection.insertOne(problem);
      res.send({
        data:result,
        message:"Your Problem added Succesfully"
      });
    });

    app.get("/specific-problem/:id", async (req, res) => {
      const categoryId= req.params.id;
      const query={categoryId:categoryId}
     
      const result= await problemCollection.find(query).toArray()
      // console.log(sellerProduct)
      res.send(result)
    })

    app.get("/check/:id", async(req,res)=>{
      console.log(req.params.id)
    })

    
    // sourav part end here

    // services
    app.get("/services", async (req, res) => {
      const query = {};
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });

    // top-questions
    app.get("/topquestions", async (req, res) => {
      const query = {};
      const result = await topQuestionsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/topquestions/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await topQuestionsCollection.find(query).toArray();
      res.send(result);
    });

    // questions
    app.get("/questions", async (req, res) => {
      const query = {};
      const result = await questionsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/questions/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await questionsCollection.find(query).toArray();
      res.send(result);
    });

    // payments
    app.post("/create-payment-intent", async (req, res) => {
      const payment = req.body;
      const price = payment.price;
      const amount = parseFloat(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payments = req.body;
      const result = await paymentsCollection.insertOne(payments);
      const id = payments.paymentId;
      const filter = { _id: ObjectId(id) };
      const updateDos = {
        $set: {
          paid: true,
          transactionId: payments.transactionId,
        },
      };
      const updateResult = await servicesCollection.updateOne(
        filter,
        updateDos
      );
      res.send({ updateResult, update });
    });

    app.post("/qna", async (req, res) => {
      const qna = req.body;
      const result = await questionCollection.insertOne(qna);

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
