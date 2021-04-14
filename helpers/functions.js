// get the url from the database without the _id field
const findLink = (url, id = {}) => url.find(id, { _id: 0 }).exec();

// show error on back-end and front-end
const displayError = (result, error) => {
  console.log(error);
  return result.json({ error: "invalid URL" });
};

module.exports = { findLink, displayError };
