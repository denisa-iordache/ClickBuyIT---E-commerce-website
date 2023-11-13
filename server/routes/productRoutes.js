// Express Initialisation
const express = require("express");
const application = express();

// Sequelize Initialisation
const sequelize = require("../sqlite/sequelize");
const { QueryTypes, where } = require("sequelize");

// Import created models
const Product = require("../models/product");
const Category = require("../models/category");

/**
 * GET - afisare lista produse.
 */
application.get("/products", async (request, response, next) => {
  try {
    const Op = require("sequelize").Op;
    const query = {};
    let pageSize = 20;
    const allowedFilters = ["name", "price", "isAvailable", "categoryId"];
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
        } else if (request.query[key] == 0 || request.query[key] == 1 || request.query[key] == 2 || request.query[key] == 3 || request.query[key] == 4 || request.query[key] == 5 || request.query[key] == 6) {
          query.where[key] = {
            [Op.eq]: request.query[key],
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

    const records = await Product.findAll(query);
    const count = await Product.count();
    response.status(200).json({ records, count });
  } catch (e) {
    console.warn(e);
    response.status(500).json({ message: "server error" });
  }
});

/**
 * GET - afisarea unui anumit produs
 */
application.get("/products/:productId", async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({
        error: `The product id ${req.params.productId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET - jonctiune produse-categorii
 */
application.get("/productsCateg", async (request, response, next) => {
  try {
    const products = await sequelize.query(
      `SELECT a.id, a.name, a.description, b.name category, a.stock, a.price, a.isAvailable
    FROM products a, categories b
    WHERE a.categoryId=b.id
    `,
      { type: QueryTypes.SELECT }
    );
    if (products.length > 0) {
      response.json(products);
    } else {
      response.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
})

/**
 * GET - afisare jonctiune produse-categorii dupa id-ul produsului
 */
application.get("/productsCateg/:productId", async (req, res, next) => {
  try {
    const product = await sequelize.query(
      `SELECT a.id, a.name, a.description, b.name category, a.stock, a.price, a.isAvailable
    FROM products a, categories b
    WHERE a.categoryId=b.id and a.id = ${req.params.productId}
    `,
      { type: QueryTypes.SELECT }
    );
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({
        error: `The product id ${req.params.productId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

application.get("/productsName/:productName", async (req, res, next) => {
  try {
    const product = await sequelize.query(
      `SELECT a.id, a.name, a.description, b.name category, a.stock, a.price, a.isAvailable
    FROM products a, categories b
    WHERE a.categoryId=b.id and a.name = ${req.params.productName}
    `,
      { type: QueryTypes.SELECT }
    );
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({
        error: `The product id ${req.params.productName} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST - adaugare produs in baza de date
 */
application.post("/products", async (request, response, next) => {
  try {
    const product = await Product.create(request.body);
    response.status(200).json({ message: "Product added!", data: product.id });
  } catch (error) {
    next(error);
  }
});


/**
 * PUT - actualizare produs
 */
application.put("/products/:productId", async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (product) {
      await product.update(req.body);
      res.status(200).json({
        message: `Product id ${req.params.productId} updated!`, data: product.id
      });
    } else {
      res.status(404).json({
        error: `The product id ${req.params.productId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE - stergere produs
 */
application.delete("/products/:productId", async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (product) {
      await product.destroy();
      res.status(200).json({
        message: `Product id ${req.params.productId} deleted!`, data: req.params.productId
      });
    } else {
      res.status(404).json({
        error: `The product id ${req.params.productId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});
module.exports = application;