'use strict';
module.exports = (sequelize, DataTypes) => {
  const messages = sequelize.define('messages', {
    from: DataTypes.INTEGER,
    to: DataTypes.INTEGER,
    message: DataTypes.STRING,
    date: DataTypes.DATE
  }, {});
  messages.associate = function(models) {
    models.users.hasMany(messages);
    messages.belongsTo(models.users, {
      foreignKey: 'from',
      targetKey: 'id',
      as: 'from-data'
    });
    messages.belongsTo(models.users, {
      foreignKey: 'to',
      targetKey: 'id',
      as: 'to-data'
    });
  };
  return messages;
};