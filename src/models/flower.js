'use strict';
module.exports = (sequelize, DataTypes) => {
  const Flower = sequelize.define('Flower', {
    category_id: DataTypes.BIGINT,
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    sort_order: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN,
  }, {
    tableName: 'flowers',
  });

  Flower.associate = (models) => {
    Flower.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    Flower.hasMany(models.FlowerImage, { foreignKey: 'flower_id', as: 'images' });
  };

  return Flower;
};
