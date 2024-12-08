const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.lkx4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const visaCollection = client.db("visasDB").collection("visa");
    const appliedVisaCollection = client
      .db("visasDB")
      .collection("AppliedVisaCollection");
    // Get method
    app.get("/allVisa", async (req, res) => {
      const cursor = visaCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/latestVisa", async (req, res) => {
      const cursor = visaCollection.find().sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray();
      // const reverse = result.reverse();
      res.send(result);
    });

    app.get("/visa/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.findOne(query);
      res.send(result);
    });
    app.get("/visa/user/:email", async (req, res) => {
      const user = req.params.email;
      const query = { userEmail: user };
      try {
        const visas = await visaCollection.find(query).toArray();
        res.send(visas);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch data" });
      }
    });
    app.get("/application/:email", async (req, res) => {
      const user = req.params.email;
      const query = { email: user };
      try {
        const appliedVisas = await appliedVisaCollection.find(query).toArray();
        res.send(appliedVisas);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch data" });
      }
    });

    // Posting

    app.post("/addVisa", async (req, res) => {
      const newVisa = req.body;
      const result = await visaCollection.insertOne(newVisa);
      console.log(newVisa);
      res.send(result);
    });
    app.post("/applyVisa", async (req, res) => {
      const newVisa = req.body;
      const result = await appliedVisaCollection.insertOne(newVisa);
      console.log(newVisa);
      res.send(result);
    });
    app.put("/updateVisa/:id", async (req, res) => {
      const id = req.params.id;
      const newUpdateVisa = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedVisa = {
        /*
         */
        $set: {
          countryImage: newUpdateVisa.countryImage,
          countryName: newUpdateVisa.countryName,
          processingTime: newUpdateVisa.processingTime,
          description: newUpdateVisa.description,
          ageRestriction: newUpdateVisa.ageRestriction,
          visaFee: newUpdateVisa.visaFee,
          validity: newUpdateVisa.validity,
          applicationMethod: newUpdateVisa.applicationMethod,
          selectedVisaType: newUpdateVisa.selectedVisaType,
          selectedDocuments: newUpdateVisa.selectedDocuments,
        },
      };
      const result = await visaCollection.updateOne(
        filter,
        updatedVisa,
        options
      );
      res.send(result);
    });

    // Delete functionality
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/application/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appliedVisaCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
