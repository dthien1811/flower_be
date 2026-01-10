'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [flowers] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM flowers WHERE slug IN ('hoa-cuc-chau-mini','bo-hoa-hong-do','hoa-huong-duong-sinh-nhat')`
    );
    const map = Object.fromEntries(flowers.map(f => [f.slug, f.id]));

    await queryInterface.bulkInsert('flower_images', [
      // cúc chậu
      { flower_id: map['hoa-cuc-chau-mini'], url: '/uploads/flowers/cuc-1.jpg', alt: 'Hoa cúc chậu - ảnh 1', is_cover: true,  sort_order: 1, createdAt: now, updatedAt: now },
      { flower_id: map['hoa-cuc-chau-mini'], url: '/uploads/flowers/cuc-2.jpg', alt: 'Hoa cúc chậu - ảnh 2', is_cover: false, sort_order: 2, createdAt: now, updatedAt: now },

      // hồng đỏ
      { flower_id: map['bo-hoa-hong-do'], url: '/uploads/flowers/hong-1.jpg', alt: 'Bó hồng đỏ - ảnh 1', is_cover: true,  sort_order: 1, createdAt: now, updatedAt: now },
      { flower_id: map['bo-hoa-hong-do'], url: '/uploads/flowers/hong-2.jpg', alt: 'Bó hồng đỏ - ảnh 2', is_cover: false, sort_order: 2, createdAt: now, updatedAt: now },

      // hướng dương
      { flower_id: map['hoa-huong-duong-sinh-nhat'], url: '/uploads/flowers/huongduong-1.jpg', alt: 'Hướng dương - ảnh 1', is_cover: true,  sort_order: 1, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('flower_images', null, {});
  },
};
