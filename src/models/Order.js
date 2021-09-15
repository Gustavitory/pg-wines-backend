const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('order', {    
      // status: {
      //   type: DataTypes.ENUM('approved', 'rejected', 'cart'),
      //   defaultValue: 'cart',
      //   allowNull: false,
      // },
      // shippingStatus: {
      //   type: DataTypes.ENUM('uninitiated', 'processing', 'approved', 'cancelled'),
      //   defaultValue: 'uninitiated',
      //   allowNull: false,
      // },
      status: {
        type: DataTypes.STRING,  // 'approved', 'rejected', 'cart', 'pending'
        defaultValue: 'cart',
        allowNull: false,
      },
      shippingStatus: {
        type: DataTypes.STRING, //'uninitiated', 'processing', 'approved', 'cancelled''uninitiated', 'processing', 'approved', 'cancelled'
        defaultValue: 'uninitiated',
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      payment: {
        type: DataTypes.STRING,
        defaultValue: 'mercado_pago',
        allowNull: false,
      },
    });
  };

