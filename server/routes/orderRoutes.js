// Express Initialisation
const express = require("express");
const application = express();

// Sequelize Initialisation
const sequelize = require("../sqlite/sequelize");
const { QueryTypes, where } = require("sequelize");
const nodemailer = require("nodemailer");

// Import created models
const Order = require("../models/order");
const User = require("../models/user");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nodemailerpopescu@gmail.com",
    pass: "jlxkaeovgkowlzvc",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * GET - afisare cos cumparaturi.
 */
// application.get("/orders/:orderId", async (request, response, next) => {
//   try {
//     const shoppingCart = await Order.findByPk(request.params.orderId);
//     if (shoppingCart) {
//       response.status(200).json(shoppingCart);
//     } else {
//       response.status(404).json({
//         error: `The shopping cart id ${request.params.orderId} couldn't be found!`,
//       });
//     }
//   } catch (err) {
//     next(err);
//   }
// });

application.get("/orders", async (request, response, next) => {
  try {
    const Op = require("sequelize").Op;
    const query = {};
    let pageSize = 20;
    const allowedFilters = ["status", "type", "payment", "data"];
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
            [Op.gte]: moment().subtract(7, 'days').toDate()
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

    const records = await Order.findAll(query);
    const count = await Order.count();
    response.status(200).json({ records, count });
  } catch (e) {
    console.warn(e);
    response.status(500).json({ message: "server error" });
  }
});

/**
 * GET - afisarea unui anumit produs
 */
application.get("/orders/:orderId", async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({
        error: `The order id ${req.params.orderId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST - adaugare cos cumparaturi
 */
application.post("/orders", async (request, response, next) => {
  try {
    const shoppingCart = await Order.create(request.body);
    if (shoppingCart.type == "order") {
      const user = await User.findByPk(shoppingCart.userId);
      if (user) {
        let mailOptions = {
          from: "nodemailerpopescu@gmail.com",
          to: user.email,
          subject: "Comanda ta pe site-ul ClickBuyIT",
          text: "Iti multumim pentru comanda! Iti poti vedea comenzile in sectiunea https://e-commerce-idm-26a9388b0a97.herokuapp.com/#/orders-history.",
        };
        transporter.sendMail(mailOptions, function (err, success) {
          if (err) {
            console.log(err);
          } else {
            console.log("Email sent successfully!");
          }
        });
      }
    }
    response.status(201).json({ message: "Shopping cart added!" });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT - actualizare cos cumparaturi
 */
application.put("/orders/:orderId", async (req, res, next) => {
  try {
    const shoppingCart = await Order.findByPk(req.params.orderId);
    if (shoppingCart) {
      await shoppingCart.update(req.body);
      res.status(200).json({
        message: `Order id ${req.params.orderId} updated!`, data: shoppingCart.id
      });
    } else {
      res.status(404).json({
        error: `The order id ${req.params.orderId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

application.get("/ordersUser/:userId", async (req, res, next) => {
  try {
    const order = await sequelize.query(
      `SELECT id, products, status, type, payment, data, userId
    FROM orders
    WHERE userId = "${req.params.userId}"
    `,
      { type: QueryTypes.SELECT }
    );

    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({
        error: `The order id ${req.params.userId} couldn't be found!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = application;