'use strict';
module.exports = (sequelize, DataTypes) => {
  const activate_account = sequelize.define('activate_account', {
    user_id: DataTypes.INTEGER,
    token: DataTypes.STRING,
    used: DataTypes.BOOLEAN
  }, {});
  activate_account.associate = function(models) {
    // associations can be defined here
  };
  return activate_account;
};