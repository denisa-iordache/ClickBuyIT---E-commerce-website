// Express Initialisation
const express = require("express");
const application = express();

// Sequelize Initialisation
const sequelize = require("../sqlite/sequelize");
const { QueryTypes, where } = require("sequelize");
const nodemailer = require("nodemailer");

// Import created models
const Comment = require("../models/comment");
const Product = require("../models/product");

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
 * GET - afisare specializari pentru ramura specificata.
 */
application.get("/comments", async (request, response, next) => {
  try {
    const comments = await sequelize.query(
      `SELECT a.id, a.continut, a.data, a.autor, a.status, b.name product
      FROM comments a, products b
      WHERE a.productId=b.id order by a.status desc`,
      { type: QueryTypes.SELECT }
    );
    if (comments.length > 0) {
      response.json(comments);
    } else {
      response.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET - afisare specializari pentru ramura specificata.
 */
application.get(
  "/product/:productId/comments",
  async (request, response, next) => {
    try {
      const comments = await sequelize.query(
        `SELECT * FROM comments where productId=${request.params.productId} and status="Aprobat"`,
        { type: QueryTypes.SELECT }
      );
      if (comments.length > 0) {
        response.json(comments);
      } else {
        response.json([]);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST - adaugare specializare la facultate.
 */
application.post(
  "/product/:productId/comments",
  async (request, response, next) => {
    try {
      const product = await Product.findByPk(
        request.params.productId
      );

      if (product) {
        const comment = await Comment.create(request.body);
        product.addComment(comment);
        await product.save();

        response.status(200).json(comment);
      } else {
        response.sendStatus(404);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT - actualizare universitate
 */
application.put("/comments/:commentId", async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (comment) {
      await comment.update(req.body);
      res.status(200).json({
        message: `Comentariul cu id-ul ${req.params.commentId} a fost actualizat!`, data: comment.id,
      });

      let mailOptions = {
        from: "nodemailerpopescu@gmail.com",
        to: comment.autor,
        subject: "Recenzia ta pe site-ul ClickBuyIT",
        text: "Iti multumim pentru contributia ta pe site! Recenzia ta a fost postata.",
      };
      transporter.sendMail(mailOptions, function (err, success) {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent successfully!");
        }
      });
    } else {
      res.status(404).json({
        error: `Comentariul cu id-ul ${req.params.commentId} nu a fost gasit!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

application.delete("/comments/:id", async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (comment) {
      await comment.destroy();
      res.status(200).json({
        message: `Comentariul cu id-ul ${req.params.id} a fost sters!`,
      });
    } else {
      res.status(404).json({
        error: `Comentariul cu id-ul ${req.params.id} nu a fost gasit!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = application;
