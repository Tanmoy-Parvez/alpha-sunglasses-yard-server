const express = require("express");
const cors = require("cors");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wh888.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("alpha-yard");
        const productsCollection = database.collection("products");
        const usersCollection = database.collection("users");

        // get all products from db
        app.get('/products', async (req, res) => {
            const products = await productsCollection.find({}).toArray();
            res.json(products);
        })

        // save a sign up user
        app.post('/saveUser', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // get an admin
        app.get('/saveUser/:email', async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.findOne({ email: email });
            let isAdmin = false;
            if (result?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // add an admin
        app.put('/makeAdmin/:email', async (req, res) => {
            const email = req.params.email;
            const query = await usersCollection.findOne({ email: email });
            if (query) {
                const updatedDoc = {
                    $set: {
                        role: 'admin',
                    }
                }
                const result = await usersCollection.updateOne(query, updatedDoc);
                res.json(result);
            }
            else {
                res.status(403).json({ message: 'You do not have permission to make admin' })
            }
        })
    }

    finally {
        // await client.close();
    }
}
run().catch(console.dir)

// check the server is running or not
app.get("/", (req, res) => {
    res.send("Server running successfully");
});

app.listen(port, () => {
    console.log("listening on port", port);
});
