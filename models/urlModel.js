// set db schema & model
const mongoose = require("mongoose"),
  urlSchema = new mongoose.Schema(
    {
      url: String,
      id: Number
    }, // get rid of __v
    { versionKey: false }
  );

// connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// check db connection status
mongoose.connection.once("open", () =>
  mongoose.connection.readyState === 1
    ? console.log("DB Connection Successful!")
    : console.log("Didn't connect to the DB!")
);

// export model so we can access it from api.js
module.exports = mongoose.model("Url", urlSchema);
