'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('flowers', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true, allowNull: false },

      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      name: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },

      description: { type: Sequelize.TEXT, allowNull: true },

      // nếu không cần giá thì bạn có thể xoá field này
      price: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('flowers', ['category_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('flowers');
  },
};
