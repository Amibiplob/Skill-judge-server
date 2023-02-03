const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const corsOptions = {
    origin: "http://localhost:3000",
};
const app = express();
require("dotenv").config();
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
    res.header({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
    });
    next();
});
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
        const questionCollection = database.collection(
            "userquestionCollection"
        );
        const servicesCollection = database.collection("services");
        const paymentsCollection = database.collection("payments");
        const topQuestionsCollection = database.collection("topquestions");
        const questionsCollection = database.collection("question");
        const userCollection = database.collection("user");
        const quizCollection = database.collection("quiz");
        const totalQuizCollection = database.collection("totalQuiz");
        const quizSavedCollection = database.collection("quizSaved");
        // Question
        app.get("/qnasingle/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await questionCollection.findOne(query);
            res.send([result]);
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
        });
        // saved quiz/srabon
        app.post("/savedquiz", async (req, res) => {
            const saved = req.body;
            const result = await quizSavedCollection.insertOne(saved);
            res.json(result);
            console.log(saved);
        });

        app.post("/quiz", async (req, res) => {
            const addQuiz = req.body;
            const result = await quizCollection.insertOne(addQuiz);
            res.send(result);
        });

        app.delete("/quiz", async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            const result = await quizCollection.deleteOne(query);
            console.log(result);
            if (result.deletedCount === 1) {
                res.send("Successfully deleted one document.");
            } else {
                res.send(
                    "No documents matched the query. Deleted 0 documents."
                );
            }
        });

        // Compiler
        http: app.post("/compiler", async (req, res) => {
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

        //getUser by email
        app.get('/user', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const users = await userCollection.find(query).toArray();
            res.send(users);
        })

        //Create user
        app.post('/user', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const alreadyExist = await userCollection.findOne(query);
            if (alreadyExist) {
                return;
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        //update users information
        app.put('/updateUser', async (req, res) => {
            const userEmail = req.query.email;
            // console.log(userEmail);
            const data = req.body;
            const { name, email, mobile, occupation, address, photo } = data;
            // console.log(data);
            const filter = { email: userEmail }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name,
                    email,
                    occupation,
                    mobile,
                    address,
                    photo
                }
            };
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })



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
                data: result,
                message: "Your Problem added Succesfully",
            });
        });

        app.get("/specific-problem/:id", async (req, res) => {
            const categoryId = req.params.id;
            const query = { categoryId: categoryId };

            const result = await problemCollection.find(query).toArray();
            // console.log(sellerProduct)
            res.send(result);
        });

        app.get("/check/:id", async (req, res) => {
            console.log(req.params.id);
        });

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
        app.get("/top-questions", async (req, res) => {
            const query = {};
            const result = await topQuestionsCollection.find(query).toArray();
            res.send(result);
        });
        app.get("/top-questions/:id", async (req, res) => {
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

        // total quiz
        app.get("/total-quiz", async (req, res) => {
            try {
                const query = {};
                const result = await quizCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).json(error.message);
            }
        });

        // insert new quiz
        app.post("/quizs", async (req, res) => {
            try {
                const quizs = req.body;
                const result = await questionCollection.insertOne(quizs);
                res.json(result);
            } catch (error) {
                res.status(500).json(error.message);
            }
        });

        // search entire collection result
        app.get("/search-all", async (req, res) => {
            try {
                if (req.query.searchKeyword) {
                    // const a = await questionCollection
                    //     .aggregate([
                    //         { $limit: 1 },
                    //         {
                    //             $facet: {
                    //                 c1: [
                    //                     {
                    //                         $lookup: {
                    //                             from: "questionCollection",
                    //                             pipeline: [
                    //                                 {
                    //                                     $match: {
                    //                                         question:
                    //                                             req.query
                    //                                                 .searchKeyword,
                    //                                     },
                    //                                 },
                    //                             ],
                    //                             as: "collection1",
                    //                         },
                    //                     },
                    //                 ],
                    //                 c2: [
                    //                     {
                    //                         $lookup: {
                    //                             from: "quiz",
                    //                             pipeline: [
                    //                                 {
                    //                                     $match: {
                    //                                         name: req.query
                    //                                             .searchKeyword,
                    //                                     },
                    //                                 },
                    //                             ],
                    //                             as: "collection2",
                    //                         },
                    //                     },
                    //                 ],
                    //             },
                    //         },
                    //         {
                    //             $project: {
                    //                 data: {
                    //                     $concatArrays: ["$c1", "$c2"],
                    //                 },
                    //             },
                    //         },
                    //         { $unwind: "$data" },
                    //         { $replaceRoot: { newRoot: "$data" } },
                    //     ])
                    //     .toArray(function (err, result) {
                    //         if (err) {
                    //             throw err;
                    //         }
                    //         res.send(result);
                    //     });

                    // const b = await questionCollection
                    //     .aggregate([
                    //         {
                    //             $search: {
                    //                 text: {
                    //                     query: req.query.searchKeyword,
                    //                     path: "question",
                    //                 },
                    //             },
                    //         },
                    //         {
                    //             $project: {
                    //                 _id: 1,
                    //                 userName: 1,
                    //                 userImage: 1,
                    //                 usrId: 1,
                    //             },
                    //         },
                    //         {
                    //             $addFields: {
                    //                 source: "questionCollection",
                    //                 source_count:
                    //                     "$$SEARCH_META.count.lowerBound",
                    //             },
                    //         },
                    //         {
                    //             $limit: 3,
                    //         },
                    //         {
                    //             $unionWith: {
                    //                 coll: "quiz",
                    //                 pipeline: [
                    //                     {
                    //                         $search: {
                    //                             text: {
                    //                                 query: req.query
                    //                                     .searchKeyword,
                    //                                 path: "name",
                    //                             },
                    //                         },
                    //                     },
                    //                     {
                    //                         $project: {
                    //                             _id: 1,
                    //                             name: 1,
                    //                             total: 1,
                    //                         },
                    //                     },
                    //                     {
                    //                         $limit: 3,
                    //                     },
                    //                     {
                    //                         $set: {
                    //                             source: "quiz",
                    //                             source_count:
                    //                                 "$$SEARCH_META.count.lowerBound",
                    //                         },
                    //                     },
                    //                     {
                    //                         $sort: {
                    //                             score: -1,
                    //                         },
                    //                     },
                    //                 ],
                    //             },
                    //         },
                    //         {
                    //             $facet: {
                    //                 allDocs: [],
                    //                 totalCount: [
                    //                     {
                    //                         $group: {
                    //                             _id: "$source",
                    //                             firstCount: {
                    //                                 $first: "$source_count",
                    //                             },
                    //                         },
                    //                     },
                    //                     {
                    //                         $project: {
                    //                             totalCount: {
                    //                                 $sum: "$firstCount",
                    //                             },
                    //                         },
                    //                     },
                    //                 ],
                    //             },
                    //         },
                    //     ])
                    //     .toArray();
                    // const a = await questionCollection
                    //     .aggregate([
                    //         {
                    //             $search: {
                    //                 index: "default",
                    //                 text: {
                    //                     query: req.query.searchKeyword,
                    //                     path: "question",
                    //                 },
                    //             },
                    //         },
                    //         {
                    //             $project: {
                    //                 _id: 1,
                    //                 userName: 1,
                    //                 userImage: 1,
                    //                 usrId: 1,
                    //             },
                    //         },
                    //         {
                    //             $set: {
                    //                 source: "questionCollection",
                    //             },
                    //         },
                    //         {
                    //             $limit: 3,
                    //         },
                    //         {
                    //             $unionWith: {
                    //                 coll: "quiz",
                    //                 pipeline: [
                    //                     {
                    //                         $search: {
                    //                             index: "default",
                    //                             text: {
                    //                                 query: req.query
                    //                                     .searchKeyword,
                    //                                 path: "name",
                    //                             },
                    //                         },
                    //                     },
                    //                     {
                    //                         $set: {
                    //                             source: "quiz",
                    //                         },
                    //                     },
                    //                     {
                    //                         $project: {
                    //                             _id: 1,
                    //                             name: 1,
                    //                             total: 1,
                    //                         },
                    //                     },
                    //                     {
                    //                         $limit: 3,
                    //                     },
                    //                     {
                    //                         $sort: {
                    //                             score: -1,
                    //                         },
                    //                     },
                    //                 ],
                    //             },
                    //         },
                    //     ])
                    //     .toArray();
                    const b = await questionCollection.aggregate([
                        {
                            $lookup: {
                                "from": "topquestions",
                                "localField": "question",
                                "foreignField": "question",
                                "as": "top-question",
                                "pipeline": [{
                                    "$search": {
                                        "compound": {
                                            "must": [{
                                                "queryString": {
                                                    "defaultPath": "question",
                                                    "query": req.query.searchKeyword
                                                }
                                            }],
                                        }
                                    }
                                }, {
                                    "$project": {
                                        "_id": 0
                                    }
                                }]
                            }
                        }, {
                            "$limit": 5
                        }, {
                            "$project": {
                                "_id": 1,
                                "question": 1

                            }
                        }
                    ])
                    res.json(b);
                }
            } catch (error) {
                res.status(500).json(error.message);
            }
        });
    } finally {
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log("server is working", port);
});
