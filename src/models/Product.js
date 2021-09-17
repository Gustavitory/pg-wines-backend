const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('product', {    
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ""
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image: {
      type: DataTypes.ARRAY(DataTypes.STRING(1000)),
      allowNull: true,
      defaultValue: []
    },
    sales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  });
};
