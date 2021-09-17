const { DataTypes, UUID } = require('sequelize');

module.exports = (sequelize) => {
  //See constraints here => https://sequelize.org/master/manual/validations-and-constraints.html
  sequelize.define('user', {   
    id:{
      type: DataTypes.UUID,
      allowNull:false,
      primaryKey:true
    }, 
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(64),
      // is: /^[0-9a-f]{64}$/i,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      isEmail: true
    },
    photoURL: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "https://i.imgur.com/vfrW9Xx.png"
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
};
