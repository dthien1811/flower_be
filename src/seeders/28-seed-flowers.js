'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const [cats] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM categories WHERE slug IN ('hoa-chau-canh','hoa-bo','hoa-sinh-nhat')`
    );

    const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

    await queryInterface.bulkInsert('flowers', [
      {
        category_id: catMap['hoa-chau-canh'],
        name: 'Hoa cúc chậu mini',
        slug: 'hoa-cuc-chau-mini',
        description: 'Chậu hoa cúc nhỏ gọn, phù hợp trang trí bàn làm việc.',
        price: 199000,
        sort_order: 1,
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_id: catMap['hoa-bo'],
        name: 'Bó hoa hồng đỏ',
        slug: 'bo-hoa-hong-do',
        description: 'Bó hoa hồng đỏ tone sang, phù hợp tặng người yêu.',
        price: 399000,
        sort_order: 1,
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_id: catMap['hoa-sinh-nhat'],
        name: 'Hoa hướng dương sinh nhật',
        slug: 'hoa-huong-duong-sinh-nhat',
        description: 'Hướng dương rực rỡ, vibe tích cực cho ngày sinh nhật.',
        price: 349000,
        sort_order: 1,
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('flowers', null, {});
  },
};
