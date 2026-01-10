// ================================
// FILE: be/src/routes/flower.js
// ================================
import express from "express";
import flowerController from "../controllers/flowerController";
import uploadFlowerImages from "../middleware/uploadFlowerImages";

const router = express.Router();

// ===== CATEGORY =====
router.get("/categories", flowerController.getCategories);
router.post("/categories", flowerController.createCategory);
router.put("/categories/:id", flowerController.updateCategory);
router.delete("/categories/:id", flowerController.deleteCategory);

// ===== FLOWER =====
router.get("/", flowerController.getFlowers);
router.get("/:slug", flowerController.getFlowerDetail);
router.post("/", flowerController.createFlower);
router.put("/:id", flowerController.updateFlower);
router.delete("/:id", flowerController.deleteFlower);

// ===== IMAGES =====
// FE phải gửi multipart với field name = "images"
router.post("/:id/images", uploadFlowerImages.array("images", 10), flowerController.addFlowerImages);

router.delete("/images/:id", flowerController.deleteFlowerImage);

// set main/cover
router.post("/images/:id/set-cover", flowerController.setFlowerImageCover);

export default router;
