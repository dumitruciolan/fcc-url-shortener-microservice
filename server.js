// Basic Configuration
const express = require("express"),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  app = express();

// parse the POST bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(cors());

// route to main HTML page
app.get("/", (_, res) => res.sendFile(`${process.cwd()}/views/index.html`));

// routing for API
const apiRoutes = require("./routes/api.js");
app.use("/api/", apiRoutes);

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
