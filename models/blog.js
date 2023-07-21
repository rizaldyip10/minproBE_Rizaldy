'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      blog.belongsTo(models.User)
      blog.belongsTo(models.category)
      blog.hasMany(models.likeBlog)
      blog.hasMany(models.blogKeyword)
    }
  }
  blog.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imgBlog: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    videoURL: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'blog',
  });
  return blog;
};