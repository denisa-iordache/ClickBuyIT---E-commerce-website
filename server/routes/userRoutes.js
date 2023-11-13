// Express Initialisation
const express = require("express");
const application = express();

// Sequelize Initialisation
const sequelize = require("../sqlite/sequelize");

// Import created models
const User = require("../models/user");

/**
 * GET - afisare lista utilizatori.
 */
application.get("/users", async (req, res, next) => {
  try {
    const records = await User.findAll();
    const count = await User.count();

    if (records.length > 0) {
      res.status(200).json({ records, count });
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET - afisare un anumit utilizator.
 */
application.get("/users/:userId", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({
        error: `The user id ${req.params.userId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST - adaugare utilizator.
 */
application.post("/users", async (request, response, next) => {
  try {
    const user = await User.create(request.body);
    response.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT - actualizare utilizator.
 */
application.put("/users/:userId", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (user) {
      await user.update(req.body);
      res.status(200).json({
        message: `User id ${req.params.userId} updated!`,
      });
    } else {
      res.status(404).json({
        error: `The user id ${req.params.userId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE - stergere user
 */
application.delete("/users/:userId", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (user) {
      await user.destroy();
      res.status(200).json({
        message: `User id ${req.params.userId} deleted!`,
      });
    } else {
      res.status(404).json({
        error: `The user id ${req.params.userId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});
module.exports = application;