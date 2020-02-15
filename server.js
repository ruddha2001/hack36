require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const MongoClient = require("mongodb").MongoClient;
const jwt = require("jsonwebtoken");

const app = express();

const client = new MongoClient(process.env.MONGOURL, {
  useUnifiedTopology: true
});

client.connect(function(err) {
  if (err) return console.log(err);
  console.log("Connected successfully to MongoDB");
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Express serves static content from Website
app.use(express.static(__dirname + "/Website"));

let auth = async function(req, res, next) {
  try {
    let status = await jwt.verify(req.body.token, process.env.SECRET);
    if (status == false) {
      return res.sendFile(path.join(__dirname + "/Website/login.html"));
    }
    return next();
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

app.post("/incoming", async function(req, res) {
  console.log(req.body.value);
  res.sendStatus(200);
});

app.post("/login", async function(req, res) {
  let email = req.body.email;
  let password = req.body.password;

  let collection = client.db("eagleAssist").collection("users");

  try {
    let result = await collection.findOne({ email: email });
    let status = await bcrypt.compare(password, result["password"]);
    if (status) {
      let token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
          data: "foobar",
          issuer: "Eagle Assist"
        },
        process.env.SECRET
      );
      return res.send(token);
    } else {
      return res.sendFile(
        path.join(__dirname + "/Website/login.html?status=false")
      );
    }
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

//Homepage
app.get("/", auth, function(req, res) {
  res.sendStatus(200);
});

app.listen(6600, function(err) {
  if (err) return console.log(err);
  console.log("Server running on Port 6600");
});
