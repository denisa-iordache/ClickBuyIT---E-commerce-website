"use strict";
// Express Initialisation
const express = require("express");
const cors = require("cors");

const bodyParser = require("body-parser");
const path = require('path')
const port = process.env.PORT || 8080;
const application = express();

application.use(cors({ origin: true }));
application.use(express.static(path.join(__dirname, 'build')))
application.use(bodyParser.json());

const dbRoutes = require("./routes/dbRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Express middleware
application.use(
  express.urlencoded({
    extended: true,
  })
);
application.use(express.json());

//application.use('', loginRoutes);
application.use("", dbRoutes);
application.use("", userRoutes);
application.use("", productRoutes);
application.use("", orderRoutes);
application.use("", categoryRoutes);
application.use("", commentRoutes);

// Kickstart the Express aplication
application.listen(port, () => {
  console.log(`The server is running on http://localhost: ${port}.`);
});

// Create a middleware to handle 500 status errors.
application.use((error, request, response, next) => {
  console.error(`[ERROR]: ${error}`);
  response.status(500).json(error);
});
