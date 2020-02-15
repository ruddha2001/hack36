require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const MongoClient = require("mongodb").MongoClient;
const jwt = require("jsonwebtoken");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SECRET,
    cookie: { maxAge: 300000 },
    resave: false,
    saveUninitialized: false
  })
);

const client = new MongoClient(process.env.MONGOURL, {
  useUnifiedTopology: true
});

client.connect(function(err) {
  if (err) return console.log(err);
  console.log("Connected successfully to MongoDB");
});

app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Express serves static content from Website
app.use(express.static(__dirname + "/Website"));

let auth = async function(req, res, next) {
  try {
    let status = await jwt.verify(req.session.token, process.env.SECRET);
    return next();
  } catch (err) {
    return res.sendFile(path.join(__dirname + "/Website/login.html"));
  }
};

//Incoming API
app.post("/incoming", async function(req, res) {
  console.log(req.body);
  res.sendStatus(200);
});

//Login API
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
          email: email,
          name: result["name"]
        },
        process.env.SECRET,
        {
          expiresIn: "1h",
          issuer: "eagleassist"
        }
      );
      req.session.token = token;
      res.redirect("/");
    } else {
      return res.sendFile(path.join(__dirname + "/Website/login.html"));
    }
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

//Register API
app.post("/register", async function(req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;

  try {
    let hash = await bcrypt.hash(password, 14);
    let collection = client.db("eagleAssist").collection("users");
    try {
      let response = await collection.find({ email: email }).toArray();
      if (response.length != 0) {
        console.log("Existing Email");
        return res
          .status(299)
          .sendFile(path.join(__dirname + "/Website/register.html"));
      } else {
        try {
          let result = await collection.insertOne({
            name: name,
            email: email,
            password: hash
          });
          return res.sendStatus(200);
        } catch (err) {
          console.log(err);
          return res.sendStatus(500);
        }
      }
    } catch (err) {
      console.log(err);
      return res.sendStatus(401);
    }
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

//Contact
app.get("/register", function(req, res) {
  res.sendFile(path.join(__dirname + "/Website/register.html"));
});

//Options
app.get("/", auth, function(req, res) {
  res.render("Website/options");
});

//Dashboard
app.get("/dashboard", auth, async function(req, res) {
  let dock = req.query.number;
  let collection = client.db("eagleAssist").collection("patientData");
  try {
    let result = await collection
      .find({ $or: [{ bednum: 1 }, { bednum: 2 }] })
      .toArray();
    res.render("Website/dashboard", { data: result, stationnum: dock });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

//Contact
app.get("/contact", auth, function(req, res) {
  res.sendFile(path.join(__dirname + "/Website/contact.html"));
});

app.listen(6600, function(err) {
  if (err) return console.log(err);
  console.log("Server running on Port 6600");
});
