const { Sequelize } = require("sequelize");
const dbConfig = require('./db-config')
const sequelize = new Sequelize('CONNECTION_STRING');

module.exports = sequelize;