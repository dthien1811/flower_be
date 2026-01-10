'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    sort_order: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN,
  }, {
    tableName: 'categories',
  });

  Category.associate = (models) => {
    Category.hasMany(models.Flower, { foreignKey: 'category_id', as: 'flowers' });
  };

  return Category;
};
