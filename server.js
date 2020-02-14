require("dotenv");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

let auth = function(req, res, next) {
  if (req.query.q == "wrong") {
    return res.sendStatus(403);
  }
  return next();
};

app.post("/incoming", async function(req, res) {
  console.log(req.body.value);
  res.sendStatus(200);
});

//Homepage
app.get("/", auth, function(req, res) {
  res.sendStatus(200);
});

app.listen(6600, function(err) {
  if (err) return console.log(err);
  console.log("Server running on Port 6600");
});
