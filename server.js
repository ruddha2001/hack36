require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const MongoClient = require("mongodb").MongoClient;
const jwt = require("jsonwebtoken");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

const app = express();

let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.in",
  port: 587,
  secure: true, // use TLS
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

const apiLimiter = rateLimit({
  windowMs: 1000,
  max: 1
});

app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SECRET,
    cookie: { maxAge: 300000 },
    resave: true,
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
// app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Express serves static content from Website
app.use(express.static(__dirname + "/Website"));

//Auth Middleware
let auth = async function(req, res, next) {
  try {
    let status = await jwt.verify(req.session.token, process.env.SECRET);
    return next();
  } catch (err) {
    return res.sendFile(path.join(__dirname + "/Website/login.html"));
  }
};

//Incoming API
app.post("/incoming", apiLimiter, async function(req, res) {
  try {
    let id = req.body.id;
    let val = req.body.value;
    let collection = client.db("eagleAssist").collection("patientData");
    if (id == 315067149) {
      let response = collection.insertOne({
        bednum: 1,
        pulse: val,
        spo2: 99,
        bp1: 125,
        bp2: 90
      });
    }
    if (id == 840530682) {
      let response = collection.insertOne({
        bednum: 2,
        pulse: val,
        spo2: 99,
        bp1: 125,
        bp2: 90
      });
    }
  } catch (err) {
    res.sendStatus(400);
  }
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
      .sort({ _id: -1 })
      .limit(2)
      .toArray();
    let control = await collection
      .find({ $or: [{ bednum: 1 }, { bednum: 2 }] })
      .sort({ _id: -1 })
      .skip(2)
      .toArray();
    let last = [
      { pulse: 0, spo2: 0, bp1: 0, bp2: 0 },
      { pulse: 0, spo2: 0, bp1: 0, bp2: 0 }
    ];
    let i = 0;
    for (i = 0; i < control.length; i++) {
      if (control[i].bednum == 1) {
        last[0].pulse = control[i].pulse;
        last[0].spo2 = control[i].spo2;
        last[0].bp1 = control[i].bp1;
        last[0].bp2 = control[i].bp2;
        break;
      }
    }
    for (i = 0; i < control.length; i++) {
      if (control[i].bednum == 2) {
        last[1].pulse = control[i].pulse;
        last[1].spo2 = control[i].spo2;
        last[1].bp1 = control[i].bp1;
        last[1].bp2 = control[i].bp2;
        break;
      }
    }
    let value = ["Okay", "Okay"];
    console.log(result[0].pulse + " " + last[0].pulse);
    console.log(result[1].pulse + " " + last[1].pulse);
    for (i = 0; i < 2; i++) {
      value[i] =
        Math.abs(result[i].pulse - last[i].pulse) / last[i].pulse >= 0.1 ||
        Math.abs(result[i].spo2 - last[i].spo2) / last[i].spo2 >= 0.1 ||
        Math.abs(result[i].bp1 - last[i].bp1) / last[i].bp1 >= 0.1 ||
        Math.abs(result[i].bp2 - last[i].bp2) / last[i].bp2 >= 0.1
          ? "Warning"
          : "Normal";
    }
    res.render("Website/dashboard", {
      data: result,
      stationnum: dock,
      last: last,
      value: value
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

//Contact
app.get("/contact", auth, function(req, res) {
  res.sendFile(path.join(__dirname + "/Website/contact.html"));
});

//Mailer API
app.get("/mail", function(req, res) {
  let mailList = ["ruddha.mine@gmail.com", "gitaalekhyapaul@gmail.com"];
  let message = {
    from: "me@aniruddha.in", // Sender address
    to: mailList, // List of recipients
    subject: "Report - Eagle Assist", // Subject line
    html: `<p>Your Report is available at http://localhost:6600/report?bednum=${req.body.num}` // HTML text body
  };
  transporter.sendMail(message, function(err, success) {
    if (err) {
      res.send({ status: false });
    } else {
      res.send({ status: true });
    }
  });
});

app.listen(6600, function(err) {
  if (err) return console.log(err);
  console.log("Server running on Port 6600");
});
