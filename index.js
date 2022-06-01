const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

//middle tair

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.nvnfe.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//veryfi token middletair

function veryFyJwt(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "Un-authorized" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KY, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("agency").collection("users");
    const reviewCollection = client.db("agency").collection("review");
    console.log("db connected");

    // apis

    app.get("/reviews", async (req, res) => {
      const querry = {};
      const result = await reviewCollection.find(querry).toArray();
      return res.send(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const querry = {email: email};
      const user = await userCollection.findOne(querry);
      const isadmin = user?.role === 'admin'
      res.send({admin: isadmin});
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const data = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: data,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);

      const token = jwt.sign({ email: email }, process.env.SECRET_KY, {
        expiresIn: "1h",
      });
      res.send({ result, token });
    });

    app.get("/alluser", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.send(result);
    });

    app.put("/alluser/:id", veryFyJwt, async (req, res) => {
      const requestEmail = req?.decoded?.email;
      console.log(requestEmail);
      const requesterAccount = await userCollection.findOne({
        email: requestEmail,
      });

      if (requesterAccount?.role === "admin") {
        const id = req.params.id;
        const data = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: data,
        };

        const result = await userCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } else {
        res.send({ message: "you are not admin" });
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello mama ami calu aci");
});

app.listen(port, () => {
  console.log(`ami kbl calu hoici ${port}`);
});
