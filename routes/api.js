"use strict";

const router = require("express").Router(),
  urlHandler = require("../controllers/urlHandler"),
  url = require("../models/urlModel"),
  dns = require("dns");

// receive a POST request with an URL to be saved on db
router.route("/shorturl/new").post((req, res) => {
  const { url } = req.body;
  // remove both transfer protocol & www from url
  let link = url.replace(/(^\w+:|^)\/\/|(www\.)/gi, "");

  // retrieve only the domain and check if it's a valid one
  dns.lookup(link.split("/")[0], err => {
    // return error if domain is invalid, else proceed further
    err ? res.json({ error: "invalid URL" }) : urlHandler.onSuccess(link, res);
  });
});

// retrieving all entries from the db
router.route("/shorturl").get((_, res) => {
  url
    .find()
    .exec()
    .then(d => res.json(d))
    .catch(err => {
      console.log(err);
      res.json({ error: "invalid URL" });
    });
});

// finding the URL by ID and redirecting
router.route("/shorturl/:id").get((req, res) => {
  const { id } = req.params;
  url
    .find({ id })
    .exec()
    // add HTTPS (cybersecurity & performance best practice)
    .then(entries => res.redirect(`https://${entries[0]["url"]}`))
    // error handling
    .catch(err => {
      console.log(err);
      res.json({ error: "invalid URL" });
    });
});

module.exports = router;
