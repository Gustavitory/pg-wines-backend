const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('address', {    
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zipCode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  });
};
