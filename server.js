"use strict";

// Basic Configuration
const express = require("express"),
  mongo = require("mongodb"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  db = mongoose.connection,
  port = process.env.PORT,
  cors = require("cors"),
  dns = require("dns"),
  app = express();

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
  db.readyState === 1
    ? console.log("DB Connection Successful!")
    : console.log("Didn't connect to the DB!");
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
    err ? res.json({ error: "invalid URL" }) : onComplete();
  });

  const onComplete = () => {
    let theData;

    urlModel
      .find()
      .exec()
      .then(docs => {
        theData = docs;
        // afterwards, create a document instance & generate the short url
        var doc = new urlModel({ id: theData.length, url: link });
        theData = theData.filter(obj => obj["url"] === link);
        // check if already in db
        if (theData.length === 0) {
          doc // save it to the db if not there
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
  };
});

// retrieving the shortened URL from the db
app.get("/api/shorturl", (req, res) => {
  urlModel
    .find()
    .exec()
    .then(d => res.json(d))
    .catch(err => {
      console.log(err);
      res.json({ error: err });
    });
});

// URL redirecting
app.get("/api/shorturl/:id", (req, res) => {
  const { id } = req.params;

  urlModel
    .find({ id })
    .exec()
    // add HTTPS (cybersecurity best practice)
    .then(docs => res.redirect("https://" + docs[0]["url"]))
    // handle error situations
    .catch(err => {
      console.log(err);
      res.json({ error: "invalid URL" });
    });
});

app.listen(port, () => {
  console.log("Node.js listening ...");
});

// doesn't work for subpages (e.g.: https://www.freecodecamp.org/forum/)
// adding multiple entries with the same id if no http/https specified
// fix the returned object (current one returns too much info)
