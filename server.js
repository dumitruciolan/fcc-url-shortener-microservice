"use strict";

// Basic Configuration
const express = require("express"),
  mongo = require("mongodb"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  dns = require("dns"),
  app = express(),
  port = process.env.PORT || 3000,
  db = mongoose.connection;

// parse the POST bodies
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

// connect to the database
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// check db connection status
db.once("open", () => {
  if (db.readyState === 1) console.log("DB Connection Successful!");
  db.on("error", console.error.bind(console, "DB Connection Error!"));
});

// set db schema & model
const urlSchema = new mongoose.Schema({
    id: Number,
    url: String
  }),
  urlModel = mongoose.model("url", urlSchema);

// route to main HTML page
app.get("/", (_, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// receive a POST request with an URL to be saved on db
app.post("/api/shorturl/new", (req, res) => {
  const { url } = req.body,
    // remove the transfer protocol from url
    link = url.replace(/(^\w+:|^)\/\//gi, "");

  // check if it's a valid domain
  dns.lookup(link, (err, addresses, family) => {
    // return error msg if domain wasn't found
    (err) ? res.json({ error: "invalid URL" }) : onComplete();
  });

  const onComplete = () => {
    let theData;

    urlModel
      .find()
      .exec()
      .then(docs => {
        theData = docs;
      // afterwards, create a document instance & generate the short url
        var doc = new urlModel({ id: theData.length, url: req.body.url });
        theData = theData.filter(obj => obj["url"] === req.body.url);
        // check if already in db
        if (theData.length === 0) {
          doc// save it to the db if not there
            .save()
            .then(result => {
              res.json(result);
            })
            .catch(err => {
              console.log(err);
              res.json({ error: err });
            });
        } else {
          res.json({ error: `URL already in database as ${theData[0].id}` });
        }
      })
      .catch(err => {
        console.log(err);
        res.json({ error: err });
      });
  }
});

// retrieving the shortened URL from the db
app.get("/api/shorturl", (req, res) => {
  urlModel
  // maybe use mongoose findOne URL for this?
    .find()
    .exec()
    .then(d => res.json(d))
    .catch(err => {
      console.log(err);
      res.json({ error: err });
    });
});

// Redirect user to URL
app.get("/api/shorturl/:short", (req, res) => {
  const { short } = req.params;
  urlModel
    .find({ id: short })
    .exec()
    .then(docs => {
      res.redirect(docs[0]["url"]);
    }) // handle error situations
    .catch(err => {
      console.log(err);
      res.json({ error: err });
    });
});

app.listen(port, () => {
  console.log("Node.js listening ...");
});

// multiple websites can be added if protocol is not mentioned
// fix the returned object