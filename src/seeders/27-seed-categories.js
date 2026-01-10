'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('categories', [
      { name: 'Hoa chậu cảnh', slug: 'hoa-chau-canh', sort_order: 1, is_active: true, createdAt: now, updatedAt: now },
      { name: 'Hoa bó', slug: 'hoa-bo', sort_order: 2, is_active: true, createdAt: now, updatedAt: now },
      { name: 'Hoa sinh nhật', slug: 'hoa-sinh-nhat', sort_order: 3, is_active: true, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
