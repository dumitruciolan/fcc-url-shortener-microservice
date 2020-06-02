"use strict";

let data;
const url = require("../models/urlModel");

// used if dns lookup succeds
const onSuccess = (link, res) => {
  url
    .find()
    .exec()
    .then(entries => {
      data = entries;
      // create the document entry & generate the short url
      const entry = new url({ id: data.length, url: link });

      entry // add the new url to the db
        .save()
        // return the required JSON structure
        .then(result => {
          res.json({ original_url: result.url, short_url: result.id });
        })
        .catch(err => {
          console.log(err);
          res.json({ error: "invalid URL" });
        });
    })
    .catch(err => {
      console.log(err);
      res.json({ error: "invalid URL" });
    });
};

module.exports = { onSuccess };
