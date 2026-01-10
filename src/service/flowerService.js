// ================================
// FILE: fe/src/services/flowerService.js
// ================================
import axios from "../setup/axios";

// ===== PUBLIC (SITE) =====
export const getCategories = () => axios.get("/api/flowers/categories");

export const getFlowers = (params = {}) => axios.get("/api/flowers", { params });

export const getFlowerDetail = (slug) => axios.get(`/api/flowers/${slug}`);

// ===== ADMIN CRUD (dùng chung endpoint) =====
export const createCategory = (data) => axios.post("/api/flowers/categories", data);
export const updateCategory = (id, data) => axios.put(`/api/flowers/categories/${id}`, data);
export const deleteCategory = (id) => axios.delete(`/api/flowers/categories/${id}`);

export const createFlower = (data) => axios.post("/api/flowers", data);
export const updateFlower = (id, data) => axios.put(`/api/flowers/${id}`, data);
export const deleteFlower = (id) => axios.delete(`/api/flowers/${id}`);

// upload images: field name MUST be "images"
export const uploadFlowerImages = (flowerId, files) => {
  const form = new FormData();
  for (const f of files) form.append("images", f);
  return axios.post(`/api/flowers/${flowerId}/images`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteFlowerImage = (imageId) => axios.delete(`/api/flowers/images/${imageId}`);

export const setFlowerMainImage = (imageId) => axios.post(`/api/flowers/images/${imageId}/set-cover`);

// ====== ALIASES (để code cũ của bạn khỏi lỗi import) ======
export const getAdminCategories = getCategories;
export const getAdminFlowers = getFlowers;
export const getAdminFlowerDetail = getFlowerDetail;

export const createAdminFlower = createFlower;
export const updateAdminFlower = updateFlower;
export const deleteAdminFlower = deleteFlower;

export const uploadAdminFlowerImages = uploadFlowerImages;
export const deleteAdminFlowerImage = deleteFlowerImage;
export const setAdminFlowerMainImage = setFlowerMainImage;
