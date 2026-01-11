// ================================
// FILE: be/src/controllers/flowerController.js
// (NO slugify package needed)
// ================================
const fs = require("fs");
const path = require("path");
const db = require("../models");

// tự slugify tiếng Việt (không cần thư viện)
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

// ===== CATEGORY =====
const getCategories = async (req, res) => {
  try {
    const rows = await db.Category.findAll({
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    });
    return res.json({ categories: rows });
  } catch (e) {
    console.error("getCategories error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, sort_order, is_active } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ message: "Name required" });

    const finalSlug = (slug?.trim() ? toSlug(slug) : toSlug(name)) || `cat-${Date.now()}`;

    const created = await db.Category.create({
      name: name.trim(),
      slug: finalSlug,
      sort_order: safeNumber(sort_order, 0),
      is_active: safeBool(is_active, true),
    });

    return res.json({ category: created });
  } catch (e) {
    console.error("createCategory error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, slug, sort_order, is_active } = req.body || {};
    const row = await db.Category.findByPk(id);
    if (!row) return res.status(404).json({ message: "Category not found" });

    const finalName = name?.trim() || row.name;
    const finalSlug = slug?.trim() ? toSlug(slug) : row.slug;

    await row.update({
      name: finalName,
      slug: finalSlug,
      sort_order: safeNumber(sort_order, row.sort_order ?? 0),
      is_active: is_active !== undefined ? safeBool(is_active, row.is_active ?? true) : row.is_active,
    });

    return res.json({ category: row });
  } catch (e) {
    console.error("updateCategory error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await db.Category.findByPk(id);
    if (!row) return res.status(404).json({ message: "Category not found" });

    const count = await db.Flower.count({ where: { category_id: id } });
    if (count > 0) return res.status(400).json({ message: "Cannot delete (category has flowers)" });

    await row.destroy();
    return res.json({ ok: true });
  } catch (e) {
    console.error("deleteCategory error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

// ===== FLOWER LIST (supports categorySlug, search, sort) =====
const getFlowers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const offset = (page - 1) * limit;

    const { category_id, categorySlug, search, sort = "newest", is_active } = req.query;

    const where = {};

    if (is_active !== undefined) {
      where.is_active = String(is_active) === "true" || String(is_active) === "1";
    }

    if (categorySlug) {
      const cat = await db.Category.findOne({
        where: { slug: String(categorySlug).trim() },
        attributes: ["id"],
      });

      if (!cat) {
        return res.json({ pagination: { page, limit, total: 0, totalPages: 0 }, flowers: [] });
      }
      where.category_id = cat.id;
    } else if (category_id) {
      where.category_id = Number(category_id);
    }

    if (search && String(search).trim()) {
      const kw = String(search).trim();
      where.name = { [db.Sequelize.Op.like]: `%${kw}%` };
    }

    let order = [["id", "DESC"]];
    if (sort === "price_asc") order = [["price", "ASC"], ["id", "DESC"]];
    if (sort === "price_desc") order = [["price", "DESC"], ["id", "DESC"]];
    if (sort === "newest") order = [["id", "DESC"]];

    const { count, rows } = await db.Flower.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
        {
          model: db.FlowerImage,
          as: "images",
          required: false,
          attributes: ["id", "url", "alt", "is_cover", "sort_order"],
        },
      ],
    });

    const flowers = rows.map((f) => {
      const json = f.toJSON();
      const imgs = Array.isArray(json.images) ? [...json.images] : [];
      imgs.sort(
        (a, b) =>
          Number(b.is_cover) - Number(a.is_cover) ||
          Number(a.sort_order || 0) - Number(b.sort_order || 0)
      );
      return { ...json, images: imgs };
    });

    return res.json({
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
      flowers,
    });
  } catch (e) {
    console.error("getFlowers error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

const getFlowerDetail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const row = await db.Flower.findOne({
      where: { slug },
      include: [
        { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
        {
          model: db.FlowerImage,
          as: "images",
          required: false,
          attributes: ["id", "url", "alt", "is_cover", "sort_order"],
        },
      ],
    });

    if (!row) return res.status(404).json({ message: "Flower not found" });

    const json = row.toJSON();
    json.images = (json.images || []).sort(
      (a, b) =>
        Number(b.is_cover) - Number(a.is_cover) ||
        safeNumber(a.sort_order, 0) - safeNumber(b.sort_order, 0)
    );

    return res.json({ flower: json });
  } catch (e) {
    console.error("getFlowerDetail error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ===== FLOWER CRUD =====
const createFlower = async (req, res) => {
  try {
    const { category_id, name, slug, description, short_description, price, sort_order, is_active } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ message: "Name required" });
    if (!category_id) return res.status(400).json({ message: "Category required" });

    const finalSlug = slug?.trim() ? toSlug(slug) : toSlug(name);

    const created = await db.Flower.create({
      category_id: Number(category_id),
      name: name.trim(),
      slug: finalSlug,
      description: description || "",
      short_description: short_description || "",
      price: safeNumber(price, 0),
      sort_order: safeNumber(sort_order, 0),
      is_active: safeBool(is_active, true),
    });

    return res.json({ flower: created });
  } catch (e) {
    console.error("createFlower error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

const updateFlower = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await db.Flower.findByPk(id);
    if (!row) return res.status(404).json({ message: "Flower not found" });

    const { category_id, name, slug, description, short_description, price, sort_order, is_active } = req.body || {};
    const finalName = name?.trim() || row.name;
    const finalSlug = slug?.trim() ? toSlug(slug) : row.slug;

    await row.update({
      category_id: category_id ? Number(category_id) : row.category_id,
      name: finalName,
      slug: finalSlug,
      description: description ?? row.description,
      short_description: short_description ?? row.short_description,
      price: price !== undefined ? safeNumber(price, row.price) : row.price,
      sort_order: sort_order !== undefined ? safeNumber(sort_order, row.sort_order ?? 0) : row.sort_order,
      is_active: is_active !== undefined ? safeBool(is_active, row.is_active ?? true) : row.is_active,
    });

    return res.json({ flower: row });
  } catch (e) {
    console.error("updateFlower error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

const deleteFlower = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await db.Flower.findByPk(id);
    if (!row) return res.status(404).json({ message: "Flower not found" });

    const imgs = await db.FlowerImage.findAll({ where: { flower_id: id } });

    for (const img of imgs) {
      try {
        const p = path.join(process.cwd(), img.url.replace(/^\//, ""));
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch {}
      await img.destroy();
    }

    await row.destroy();
    return res.json({ ok: true });
  } catch (e) {
    console.error("deleteFlower error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

// ===== IMAGES =====
const addFlowerImages = async (req, res) => {
  try {
    const flowerId = Number(req.params.id);
    const flower = await db.Flower.findByPk(flowerId);
    if (!flower) return res.status(404).json({ message: "Flower not found" });

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: "No files" });

    const existingCount = await db.FlowerImage.count({ where: { flower_id: flowerId } });

    const createdRows = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const url = `/uploads/flowers/${f.filename}`;

      const created = await db.FlowerImage.create({
        flower_id: flowerId,
        url,
        alt: f.originalname || flower.name || "flower",
        is_cover: existingCount === 0 && i === 0 ? true : false,
        sort_order: existingCount + i + 1,
      });

      createdRows.push(created);
    }

    return res.json({ images: createdRows });
  } catch (e) {
    console.error("addFlowerImages error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

const deleteFlowerImage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const img = await db.FlowerImage.findByPk(id);
    if (!img) return res.status(404).json({ message: "Image not found" });

    try {
      const p = path.join(process.cwd(), img.url.replace(/^\//, ""));
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {}

    const flowerId = img.flower_id;
    const wasCover = !!img.is_cover;

    await img.destroy();

    if (wasCover) {
      const first = await db.FlowerImage.findOne({
        where: { flower_id: flowerId },
        order: [["id", "ASC"]],
      });
      if (first) await first.update({ is_cover: true });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error("deleteFlowerImage error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

const setFlowerImageCover = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid image id" });

    const img = await db.FlowerImage.findByPk(id);
    if (!img) return res.status(404).json({ message: "Image not found" });

    await db.FlowerImage.update({ is_cover: false }, { where: { flower_id: img.flower_id } });
    await img.update({ is_cover: true });

    return res.json({ ok: true, message: "Set cover success" });
  } catch (e) {
    console.error("setFlowerImageCover error:", e);
    return res.status(500).json({ message: e?.message || "Internal server error" });
  }
};

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
