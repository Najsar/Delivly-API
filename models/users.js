'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    nick: DataTypes.STRING,
    pass: DataTypes.STRING,
    email: DataTypes.STRING,
    avatar: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    active: DataTypes.BOOLEAN
  }, {});
  users.associate = function(models) {
    // associations can be defined here
  };
  return users;
};