"use strict";

// Basic Configuration
const express = require("express"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  dns = require("dns"),
  app = express();

// parse the POST bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(cors());

// connect to the database
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// check db connection status
mongoose.connection.once("open", () => {
  mongoose.connection.readyState === 1
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
  const { url } = req.body;
  // remove both transfer protocol & www from url
  let link = url.replace(/(^\w+:|^)\/\/|(www\.)/gi, "");

  // retrieve only the domain and check if it's a valid one
  dns.lookup(link.split("/")[0], (err, addresses, family) => {
    // return error if domain is invalid, else proceed further
    err ? res.json({ error: "invalid URL" }) : onSuccess();
  });

  const onSuccess = () => {
    let data;

    urlModel
      .find()
      .exec()
      .then(entries => {
        data = entries;
        // create the document entry & generate the short url
        const entry = new urlModel({ id: data.length, url: link });
        // check if already in the db
        data = data.filter(obj => obj["url"] === link);
        if (data.length === 0) {
          entry // add it if not there
            .save()
            // return the required JSON structure
            .then(result => {
              res.json({ original_url: result.url, short_url: result.id });
            })
            .catch(err => {
              console.log(err);
              res.json({ error: "invalid URL" });
            });
        } else {
          res.json({ error: `URL already in database as ${data[0].id}` });
        }
      })
      .catch(err => {
        console.log(err);
        res.json({ error: "invalid URL" });
      });
  };
});

// retrieving all entries from the db
app.get("/api/shorturl", (_, res) => {
  urlModel
    .find()
    .exec()
    .then(d => res.json(d))
    .catch(err => {
      console.log(err);
      res.json({ error: "invalid URL" });
    });
});

// finding the URL by ID and redirecting
app.get("/api/shorturl/:id", (req, res) => {
  const { id } = req.params;
  urlModel
    .find({ id })
    .exec()
    // add HTTPS & www (cybersecurity & performance best practice)
    .then(entries => res.redirect(`https://www.${entries[0]["url"]}`))
    // error handling
    .catch(err => {
      console.log(err);
      res.json({ error: "invalid URL" });
    });
});

// handle inexistent routes
app.use((_, res) =>
  res
    .status(404)
    .type("txt")
    .send("Not found")
);

app.listen(process.env.PORT || 3000, err => {
  if (err) throw err;
  console.log("Node.js listening ...");
});
