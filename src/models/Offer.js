const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('offer', {    
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
//     categoryId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    from: {
      type: DataTypes.DATE,
      allowNull: false
    },
    until: {
      type: DataTypes.DATE,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: false
    }
  });
};
