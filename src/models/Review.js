const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('review', {   
    // id:{
    //   type: DataTypes.UUID,
    //   primaryKey: true,
    //   allowNull: false
    // },
    comment: {
      type: DataTypes.TEXT
    },
    rating: {
      type: DataTypes.STRING({
        values: ["0","1","2","3","4","5"]
      }),
      allowNull: false
    }
  });
};
