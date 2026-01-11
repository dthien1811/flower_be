// be/src/middleware/uploadFlowerImages.js
const multer = require("multer");

// DÙNG MEMORY STORAGE (CHO CLOUDINARY)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only PNG/JPG/WEBP allowed"), ok);
};

// ❗❗ EXPORT MULTER INSTANCE
const uploadFlowerImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = uploadFlowerImages;
