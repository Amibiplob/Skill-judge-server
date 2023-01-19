const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skill-judge.old6dyc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        const database = client.db("Skill-judge");
        const qnaCollection = database.collection("qna");
        const servicesCollection = database.collection("services");
        const paymentsCollection = database.collection("payments");

        app.get("/qnasingle", async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };

            const result = await qnaCollection.findOne(query);

            res.send(result);
        });

        // question answer
        app.post("qna", async (req, res) => {
            const qna = req.body;
            const result = await qnaCollection.insertOne(qna);
            res.send(result);
        });

        app.get("/qna", async (req, res) => {
            const query = {};
            const cursor = qnaCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // partial search question endpoint
        app.get("/search-qna", async (req, res) => {
            let searchResult;
            if (req.query.searchQuery) {
                const cursor = qnaCollection.find({
                    $text: { $search: `\"${req.query.searchQuery}\"` },
                });
                searchResult = await cursor.toArray();
            } else {
                searchResult = await qnaCollection.find({}).toArray();
            }
            res.send(searchResult);
        });

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
