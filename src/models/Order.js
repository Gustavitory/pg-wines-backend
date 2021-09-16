const { DataTypes, Sequelize, UUID } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('order', {    
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
        defaultValue: new Date(),
        allowNull: false,
      },
      payment: {
        type: DataTypes.STRING,
        defaultValue: 'mercado_pago',
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID
      }
    });
  };

