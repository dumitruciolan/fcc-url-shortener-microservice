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

// database connection error?
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  // check moongose connection status
  if (db.readyState === 1) console.log("Connection Successful!");

  // set db schema & model (url & id)
  const urlSchema = new mongoose.Schema(
      {
        original_url: String,
        short_url: Number
      }, // shows when the entry was created
      { timestamps: true }
    ),
    Entry = mongoose.model("short_url", urlSchema);

  // route to main HTML page
  app.get("/", (req, res) => {
    res.sendFile(`${process.cwd()}/views/index.html`);
  });

  // receive a POST request with an URL to be saved on db
  app.post("/api/shorturl/new", (req, res) => {
    const { url } = req.body,
      // remove the transfer protocol from url
      link = url.replace(/(^\w+:|^)\/\//, "");

    // check if it's a valid domain
    dns.lookup(link, (err, addresses, family) => {
      // return error msg if domain wasn't found
      if (err) res.json({ error: "invalid URL" });
      // otherwise, generate the shortened url

      // afterwards, create a document instance
      let entry = new Entry({ original_url: link, short_url: "" });

      // and save it to the db
      entry.save(err => {
        if (err) return console.error(err);
      });

      // lastly, display the entry in JSON format
      res.json({ original_url: link, short_url: "" });
    });
  });
});

// retrieving the shortened URL from the db
app.get("api/shorturl/:id", (req, res) => {
  // mongoose findOne URL saved for this id
  // Redirect user to URL with res(redirect)
  // handle error situations
});

app.listen(port, () => {
  console.log("Node.js listening ...");
});

// we shouldn't add duplicates in the db!