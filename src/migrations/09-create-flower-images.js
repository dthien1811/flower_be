'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('flower_images', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true, allowNull: false },

      flower_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'flowers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      url: { type: Sequelize.STRING(1024), allowNull: false },
      alt: { type: Sequelize.STRING(255), allowNull: true },

      is_cover: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('flower_images', ['flower_id']);
    await queryInterface.addIndex('flower_images', ['flower_id', 'is_cover']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('flower_images');
  },
};
