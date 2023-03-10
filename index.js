const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const app = express();
require("dotenv").config();
const jsonWebToken = require("jsonwebtoken");

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@skill-judge.old6dyc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

////////////////

const blog = require("./blog");
const compiler = require("./compiler");
const jwt = require("./jwt");
const user = require("./user");
const review = require("./review");
const community = require("./community");

////////////////////

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
        const commentsCollection = database.collection("QnaComments");
        const teamCollection = database.collection("team-member");
        const problemsCollection = database.collection("problems");
        const compilerResultCollection = database.collection("compilerResult");
        const reviewsCollection = database.collection("reviewsCollection");
        const accordionCollection = database.collection("accordion");

        ////////////////////////////

        app.use("/blog", blog);
        app.use("/compiler", compiler);
        app.use("/jwt", jwt);
        app.use("/user", user);
        app.use("/review", review);
        app.use("/community", community);

        //////////////////////////

        // Function for verify jwt
        function verifyJWT(req, res, next) {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).send("unauthorized access");
            }
            const token = authHeader.split(" ")[1];

            jsonWebToken.verify(
                token,
                process.env.ACCESS_TOKEN,
                function (err, decoded) {
                    if (err) {
                        return res
                            .status(403)
                            .send({ message: "forbidden access" });
                    }
                    req.decoded = decoded;
                    next();
                }
            );
        }
        const verifyAdmin = async (req, res, next) => {
            next();
        };
        app.get("/users/admin/:adminEmail", verifyAdmin, async (req, res) => {
            try {
                const query = {
                    email: req.params.adminEmail,
                };
                const user = await userCollection.findOne(query);
                res.status(200).send({
                    isAdmin: user?.role === "admin",
                });
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });
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
            // console.log(result);
            res.send(result);
        });
        // team-member-api
        app.get("/team", async (req, res) => {
            const query = {};
            const result = await teamCollection.find(query).toArray();
            res.send(result);
        });

        // qna-comment/srabon
        app.post("/comment", async (req, res) => {
            const comments = req.body;
            const result = await commentsCollection.insertOne(comments);
            res.send({ ...result, ...req.body });
        });

        app.get("/allComments", async (req, res) => {
            const CommentId = req.params.CommentId;
            let query = {};
            if (CommentId) {
                query = { CommentId: CommentId };
            }
            const comments = await commentsCollection.find(query).toArray();
            res.send(comments);
            // console.log(comments);
        });

        // srabon:delete qna
        app.delete("/deleteqna/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await questionCollection.deleteOne(filter);
            res.send({ ...result, ...req.body });
        });
        // srabon:delete reply
        app.delete("/deletereply/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await commentsCollection.deleteOne(filter);
            res.send({ ...result, ...req.body });
        });
        // srabon/edit qna
        app.put("/editqna/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const query = req.body.question;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    question: query,
                },
            };
            const result = await questionCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
            console.log(query);
        });
        // srabon problem
        app.get("/problems", async (req, res) => {
            const query = {};
            const result = await problemsCollection.find(query).toArray();
            res.send(result);
        });
        app.get("/problems/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await problemsCollection.find(query).toArray();
            res.send(result);
        });
        // -------srabon compiler data update-------

        //////////////////// ////////////////////////              compailer/result      ////////////////////////////////////////////         //////////
        app.post("/compileResult", async (req, res) => {
            const body = req.body;
            const result = await compilerResultCollection.insertOne(body);
            res.send(result);
        });
        // -------srabon compiler data update-------

        /*---- Afzal working here ----*/
        // Get All users
        app.get("/all-users", async (req, res) => {
            const query = {};
            const allUsers = await userCollection.find(query).toArray();
            res.send(allUsers);
        });
        // Delete user

        /////////////////////////////////            user/:id ///////////////////////////////////////////////

        // app.delete("/user/:id", async (req, res) => {
        // 	const id = req.params.id;
        // 	const filter = { _id: ObjectId(id) };
        // 	const user = await userCollection.deleteOne(filter);
        // 	res.send(user);
        // });

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
            // console.log(saved);
        });
        app.get("/singlequiz", verifyJWT, async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const users = await quizSavedCollection.find(query).toArray();
            res.send(users);
        });
        app.get("/allquiz", async (req, res) => {
            const query = {};
            const users = await quizSavedCollection.find(query).toArray();
            res.send(users);
        });

        app.get("/singlesubmission", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const users = await compilerResultCollection.find(query).toArray();
            res.send(users);
        });
        app.get("/allsubmission", async (req, res) => {
            const query = {};
            const users = await compilerResultCollection.find(query).toArray();
            res.send(users);
        });
        app.post("/addProblem", async (req, res) => {
            const problem = await problemsCollection.insertOne(req.body);
            res.send(problem);
        });
        app.delete("/deleteProblem/:id", async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const result = await problemsCollection.deleteOne(query);
            if (result.deletedCount > 0) {
                res.send(result);
            } else {
                res.send(
                    "No documents matched the query. Deleted 0 documents."
                );
            }
        });

        // app.post("/quiz", async (req, res) => {
        // 	const addQuiz = req.body;
        // 	const result = await quizCollection.insertOne(addQuiz);
        // 	res.send(result);
        // });

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
            // console.log(req.params.id);
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

        app.get("/paid", async (req, res) => {
            const query = {};
            if (req.query.email) {
                query = { email: req.query.email };
            }
            const result = await paymentsCollection.find(query).toArray();
            res.send(result);
        });
        app.post("/qna", async (req, res) => {
            const qna = req.body;
            const result = await questionCollection.insertOne(qna);
            res.send(result);
        });

        // Get reviews
        app.get("/reviews", async (req, res) => {
            const query = {};
            const reviews = await reviewsCollection.find(query).toArray();
            res.send(reviews);
        });

        // dashboard
        app.get("/dashboard/widget", async (req, res) => {
            try {
                const quiz = await quizSavedCollection.countDocuments();
                const submissions =
                    await compilerResultCollection.countDocuments();
                const users = await userCollection.countDocuments();
                const paid = await paymentsCollection.find({}).toArray();
                const totalEarnings = paid.reduce((acc, cur) => {
                    acc = parseFloat(cur.price) + acc;
                    return acc;
                }, 0);
                res.status(200).send({
                    quiz,
                    submissions,
                    users,
                    totalEarnings,
                });
            } catch (error) {
                res.status(501).json({ message: error.message });
            }
        });

        // accordion
        app.get("/accordions", async (req, res) => {
            const query = {};
            const accordion = await accordionCollection.find(query).toArray();
            res.send(accordion);
        });
    } finally {
    }
}

run().catch(console.dir);
app.get("/", async (req, res) => {
    res.send("Server is running");
});
app.listen(port, () => {
    console.log("Server is working", port);
});
