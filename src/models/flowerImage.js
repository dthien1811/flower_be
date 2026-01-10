'use strict';
module.exports = (sequelize, DataTypes) => {
  const FlowerImage = sequelize.define('FlowerImage', {
    flower_id: DataTypes.BIGINT,
    url: DataTypes.STRING,
    alt: DataTypes.STRING,
    is_cover: DataTypes.BOOLEAN,
    sort_order: DataTypes.INTEGER,
  }, {
    tableName: 'flower_images',
  });

  FlowerImage.associate = (models) => {
    FlowerImage.belongsTo(models.Flower, { foreignKey: 'flower_id', as: 'flower' });
  };

  return FlowerImage;
};
