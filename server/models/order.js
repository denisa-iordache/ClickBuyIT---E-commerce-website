const sequelize = require("../sqlite/sequelize");
const { DataTypes } = require("sequelize");

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  products: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM({
      values: [ 'none', 'in procesare', 'expediata']
    })
  },
  type: {
    type: DataTypes.ENUM({
      values: ['shoppingCart', 'order']
    })
  },
  payment: {
    type: DataTypes.ENUM({
      values: ['none', 'at delivery', 'paid']
    })
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
  }
});

module.exports = Order;