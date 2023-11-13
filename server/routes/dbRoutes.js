// Express Initialisation
const express = require("express");
const application = express();

// Sequelize Initialisation
const sequelize = require("../sqlite/sequelize");

// Import created models
const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");
const Order = require("../models/order");
const Comment = require("../models/comment");

// Define entities relationship
Category.hasMany(Product, { foreignKey: "categoryId" })
User.hasMany(Order, { foreignKey: "userId" })
Product.hasMany(Comment, { foreignKey: "productId" });

/**
 * Create a special GET endpoint so that when it is called it will
 * sync our database with the models.
 */
application.get("/create", async (request, response, next) => {
  try {
    await sequelize.sync({ force: true });
    response.sendStatus(204).json({ message: "Database created!" });
  } catch (error) {
    next(error);
  }
});

application.get("/update", async (req, res, next) => {
  try {
    await sequelize.sync({ alter: true });
    res.status(201).json({ message: "Database updated!" });
  } catch (err) {
    console.log(err);
    next(err);
  }
});
module.exports = application;
