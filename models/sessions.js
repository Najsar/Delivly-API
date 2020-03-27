'use strict';
module.exports = (sequelize, DataTypes) => {
  const sessions = sequelize.define('sessions', {
    user_id: DataTypes.STRING,
    session: DataTypes.STRING,
    date: DataTypes.DATE
  }, {});
  sessions.associate = function(models) {
    // associations can be defined here
  };
  return sessions;
};