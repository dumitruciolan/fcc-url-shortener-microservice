const router = require("express").Router(),
  { findLink, displayError } = require("../helpers/functions"),
  { findAndSave } = require("../controllers/urlHandler"),
  url = require("../models/urlModel"),
  dns = require("dns");

// send a POST request with an URL to be saved on db
router.route("/shorturl/new").post((req, res) => {
  const { url } = req.body;
  // remove transfer protocol & www from url
  let link = url.replace(/(^\w+:|^)\/\/|(www\.)/gi, "");

  // retrieve only the domain and check if it's a valid one
  dns.lookup(link.split("/")[0], err =>
    // return error if domain is invalid, else proceed further
    err ? displayError(res, err) : findAndSave(link, res)
  );
});

// retrieving all entries from the db
router.route("/shorturl").get((_, res) =>
  findLink(url)
    .then(data => res.json(data))
    .catch(err => displayError(res, err))
);

// find the URL by ID & redirect to that link
router.route("/shorturl/:id").get((req, res) => {
  const { id } = req.params;

  findLink(url, { id })
    // add HTTPS (cybersecurity & performance best practice)
    .then(entries => res.redirect(`https://${entries[0]["url"]}`))
    .catch(err => displayError(res, err));
});

module.exports = router;
