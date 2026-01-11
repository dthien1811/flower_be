const axios = require("../setup/axios");

// ===== PUBLIC (SITE) =====
const getCategories = () => axios.get("/api/flowers/categories");
const getFlowers = (params = {}) => axios.get("/api/flowers", { params });
const getFlowerDetail = (slug) => axios.get(`/api/flowers/${slug}`);

// ===== ADMIN CRUD =====
const createCategory = (data) => axios.post("/api/flowers/categories", data);
const updateCategory = (id, data) => axios.put(`/api/flowers/categories/${id}`, data);
const deleteCategory = (id) => axios.delete(`/api/flowers/categories/${id}`);

const createFlower = (data) => axios.post("/api/flowers", data);
const updateFlower = (id, data) => axios.put(`/api/flowers/${id}`, data);
const deleteFlower = (id) => axios.delete(`/api/flowers/${id}`);

const uploadFlowerImages = (flowerId, files) => {
  const form = new FormData();
  for (const f of files) form.append("images", f);
  return axios.post(`/api/flowers/${flowerId}/images`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const deleteFlowerImage = (imageId) => axios.delete(`/api/flowers/images/${imageId}`);
const setFlowerMainImage = (imageId) => axios.post(`/api/flowers/images/${imageId}/set-cover`);

// aliases
const getAdminCategories = getCategories;
const getAdminFlowers = getFlowers;
const getAdminFlowerDetail = getFlowerDetail;

const createAdminFlower = createFlower;
const updateAdminFlower = updateFlower;
const deleteAdminFlower = deleteFlower;

const uploadAdminFlowerImages = uploadFlowerImages;
const deleteAdminFlowerImage = deleteFlowerImage;
const setAdminFlowerMainImage = setFlowerMainImage;

module.exports = {
  getCategories,
  getFlowers,
  getFlowerDetail,
  createCategory,
  updateCategory,
  deleteCategory,
  createFlower,
  updateFlower,
  deleteFlower,
  uploadFlowerImages,
  deleteFlowerImage,
  setFlowerMainImage,

  // aliases
  getAdminCategories,
  getAdminFlowers,
  getAdminFlowerDetail,
  createAdminFlower,
  updateAdminFlower,
  deleteAdminFlower,
  uploadAdminFlowerImages,
  deleteAdminFlowerImage,
  setAdminFlowerMainImage,
};
