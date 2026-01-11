// ================================
// FILE: be/src/controllers/flowerController.js
// CLOUDINARY VERSION – FINAL
// ================================

const db = require("../models");
const cloudinary = require("cloudinary").v2;

// ================================
// CLOUDINARY CONFIG
// ================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================================
// HELPERS
// ================================
const toSlug = (str = "") => {
  const s = String(str)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return s || `item-${Date.now()}`;
};

const safeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const safeBool = (v, fallback = true) => {
  if (v === true || v === "true" || v === 1 || v === "1") return true;
  if (v === false || v === "false" || v === 0 || v === "0") return false;
  return fallback;
};

// ================================
// CATEGORY
// ================================
const getCategories = async (req, res) => {
  try {
    const rows = await db.Category.findAll({
      order: [["sort_order", "ASC"], ["id", "ASC"]],
    });
    res.json({ categories: rows });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, sort_order, is_active } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name required" });

    const created = await db.Category.create({
      name: name.trim(),
      slug: slug ? toSlug(slug) : toSlug(name),
      sort_order: safeNumber(sort_order, 0),
      is_active: safeBool(is_active, true),
    });

    res.json({ category: created });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await db.Category.findByPk(id);
    if (!row) return res.status(404).json({ message: "Category not found" });

    const { name, slug, sort_order, is_active } = req.body;

    await row.update({
      name: name?.trim() || row.name,
      slug: slug ? toSlug(slug) : row.slug,
      sort_order: safeNumber(sort_order, row.sort_order),
      is_active: is_active !== undefined ? safeBool(is_active) : row.is_active,
    });

    res.json({ category: row });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await db.Category.findByPk(id);
    if (!row) return res.status(404).json({ message: "Category not found" });

    const count = await db.Flower.count({ where: { category_id: id } });
    if (count > 0) return res.status(400).json({ message: "Category has flowers" });

    await row.destroy();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ================================
// FLOWERS
// ================================
const getFlowers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.is_active !== undefined) {
      where.is_active = safeBool(req.query.is_active);
    }

    if (req.query.categorySlug) {
      const cat = await db.Category.findOne({ where: { slug: req.query.categorySlug } });
      if (!cat) return res.json({ pagination: { page, limit, total: 0, totalPages: 0 }, flowers: [] });
      where.category_id = cat.id;
    }

    const { count, rows } = await db.Flower.findAndCountAll({
      where,
      limit,
      offset,
      order: [["id", "DESC"]],
      include: [
        { model: db.Category, as: "category" },
        { model: db.FlowerImage, as: "images" },
      ],
    });

    res.json({
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
      flowers: rows,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getFlowerDetail = async (req, res) => {
  try {
    const row = await db.Flower.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: db.Category, as: "category" },
        { model: db.FlowerImage, as: "images" },
      ],
    });

    if (!row) return res.status(404).json({ message: "Flower not found" });
    res.json({ flower: row });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const createFlower = async (req, res) => {
  try {
    const { name, category_id } = req.body;
    if (!name || !category_id) return res.status(400).json({ message: "Missing data" });

    const flower = await db.Flower.create({
      ...req.body,
      slug: toSlug(req.body.slug || name),
      price: safeNumber(req.body.price),
      sort_order: safeNumber(req.body.sort_order),
      is_active: safeBool(req.body.is_active),
    });

    res.json({ flower });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const updateFlower = async (req, res) => {
  try {
    const row = await db.Flower.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Flower not found" });

    await row.update({
      ...req.body,
      slug: req.body.slug ? toSlug(req.body.slug) : row.slug,
    });

    res.json({ flower: row });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteFlower = async (req, res) => {
  try {
    const row = await db.Flower.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: "Flower not found" });

    const images = await db.FlowerImage.findAll({ where: { flower_id: row.id } });
    for (const img of images) {
      const publicId = img.url.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId);
      await img.destroy();
    }

    await row.destroy();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ================================
// IMAGES (CLOUDINARY)
// ================================
const addFlowerImages = async (req, res) => {
  try {
    const flower = await db.Flower.findByPk(req.params.id);
    if (!flower) return res.status(404).json({ message: "Flower not found" });

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: "No files" });

    const created = [];

    for (const f of files) {
      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "flowers" },
          (err, result) => (err ? reject(err) : resolve(result))
        ).end(f.buffer);
      });

      const img = await db.FlowerImage.create({
        flower_id: flower.id,
        url: upload.secure_url,
        alt: f.originalname || flower.name,
        is_cover: false,
        sort_order: 0,
      });

      created.push(img);
    }

    res.json({ images: created });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteFlowerImage = async (req, res) => {
  try {
    const img = await db.FlowerImage.findByPk(req.params.id);
    if (!img) return res.status(404).json({ message: "Image not found" });

    const publicId = img.url.split("/").slice(-2).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    await img.destroy();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const setFlowerImageCover = async (req, res) => {
  try {
    const img = await db.FlowerImage.findByPk(req.params.id);
    if (!img) return res.status(404).json({ message: "Image not found" });

    await db.FlowerImage.update(
      { is_cover: false },
      { where: { flower_id: img.flower_id } }
    );

    await img.update({ is_cover: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ================================
// EXPORTS
// ================================
module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  getFlowers,
  getFlowerDetail,
  createFlower,
  updateFlower,
  deleteFlower,

  addFlowerImages,
  deleteFlowerImage,
  setFlowerImageCover,
};
