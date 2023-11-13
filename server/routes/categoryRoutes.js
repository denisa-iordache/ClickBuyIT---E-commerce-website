// Express Initialisation
const express = require("express");
const application = express();

// Sequelize Initialisation
const sequelize = require("../sqlite/sequelize");
const { QueryTypes, where } = require("sequelize");

// Import created models
const Category = require("../models/category");

/**
 * GET - afisare lista categorii.
 */
application.get("/categories", async (request, response, next) => {
  try {
    const Op = require("sequelize").Op;
    const query = {};
    let pageSize = 20;
    const allowedFilters = ["name", "id"];
    const filterKeys = Object.keys(request.query).filter(
      (e) => allowedFilters.indexOf(e) !== -1
    );
    if (filterKeys.length > 0) {
      query.where = {};
      for (const key of filterKeys) {
        if (isNaN(request.query[key]) == true) {
          query.where[key] = {
            [Op.like]: `%${request.query[key]}%`,
          };
        } else {
          query.where[key] = {
            [Op.lt]: parseFloat(request.query[key]),
          };
        }
      }
    }

    const sortField = request.query.sortField;
    let sortOrder = "ASC";
    if (request.query.sortOrder && request.query.sortOrder === "-1") {
      sortOrder = "DESC";
    }

    if (request.query.pageSize) {
      pageSize = parseInt(request.query.pageSize);
    }

    if (sortField) {
      query.order = [[sortField, sortOrder]];
    }

    if (!isNaN(parseInt(request.query.page))) {
      query.limit = pageSize; //->limit
      query.offset = pageSize * parseInt(request.query.page); //->skip
    }

    const records = await Category.findAll(query);
    const count = await Category.count();
    response.status(200).json({ records, count });
  } catch (e) {
    console.warn(e);
    response.status(500).json({ message: "server error" });
  }
});

/**
 * GET - afisarea unei anumite categorii dupa nume
 */
application.get("/categories/:categoryName", async (req, res, next) => {
  try {
    const category = await sequelize.query(
      `SELECT * from categories WHERE name="${req.params.categoryName}"
    `,
      { type: QueryTypes.SELECT }
    );
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({
        error: `The category id ${req.params.categoryId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET - afisarea unei anumite categorii dupa id
 */
application.get("/categoriesId/:categoryId", async (req, res, next) => {
  try {
    const category = await sequelize.query(
      `SELECT * from categories WHERE id="${req.params.categoryId}"
    `,
      { type: QueryTypes.SELECT }
    );
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({
        error: `The category id ${req.params.categoryId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST - adaugare produs in baza de date
 */
application.post("/categories", async (request, response, next) => {
  try {
    const category = await Category.create(request.body);
    response.status(200).json({ message: "Category added!", data: category.id });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT - actualizare produs
 */
application.put("/categories/:categoryId", async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.categoryId);
    if (category) {
      await category.update(req.body);
      res.status(200).json({
        message: `Category id ${req.params.categoryId} updated!`, data: category.id
      });
    } else {
      res.status(404).json({
        error: `The category id ${req.params.categoryId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE - stergere produs
 */
application.delete("/categories/:categoryId", async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.categoryId);
    if (category) {
      await category.destroy();
      res.status(200).json({
        message: `Category id ${req.params.categoryId} deleted!`, data: req.params.categoryId
      });
    } else {
      res.status(404).json({
        error: `The category id ${req.params.categoryId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});
module.exports = application;
