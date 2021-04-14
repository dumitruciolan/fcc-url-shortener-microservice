const { findLink, displayError } = require("../helpers/functions");
const url = require("../models/urlModel");

// add the new url to the db
const saveLink = (result, entry) =>
  entry
    .save()
    // return the required JSON structure
    .then(res => result.json({ original_url: res.url, short_url: res.id }))
    .catch(err => displayError(result, err));

// used if dns lookup succeds
const findAndSave = (link, result) =>
  findLink(url)
    .then(entries => {
      // create the document entry & generate the short url
      const entry = new url({ id: entries.length, url: link });

      saveLink(result, entry);
    })
    .catch(err => displayError(result, err));

module.exports = { findAndSave };
