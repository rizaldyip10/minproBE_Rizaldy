'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class likeBlog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      likeBlog.belongsTo(models.User)
      likeBlog.belongsTo(models.blog)
    }
  }
  likeBlog.init({
  }, {
    sequelize,
    modelName: 'likeBlog',
  });
  return likeBlog;
};