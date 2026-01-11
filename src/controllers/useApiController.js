const useApiService = require("../service/useApiService");

const getAuditMeta = (req) => {
  const actorUserId = req?.user?.id || null;

  return {
    actorUserId,
    ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
    userAgent: req.headers["user-agent"] || null,
  };
};

const readUsers = async (req, res) => {
  try {
    const result = await useApiService.getUsers(req.query);
    return res.status(200).json(result);
  } catch (e) {
    console.error("readUsers error:", e);
    return res.status(500).json({ error: "Server Error" });
  }
};

const createUser = async (req, res) => {
  try {
    const created = await useApiService.createUser(req.body, getAuditMeta(req));
    return res.status(201).json(created);
  } catch (e) {
    console.error("createUser error:", e);
    return res.status(400).json({ error: e?.message || "Create Failed" });
  }
};

const updateUser = async (req, res) => {
  try {
    const updated = await useApiService.updateUser(req.params.id, req.body, getAuditMeta(req));
    if (!updated) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(updated);
  } catch (e) {
    console.error("updateUser error:", e);
    return res.status(400).json({ error: e?.message || "Update Failed" });
  }
};

const deleteUser = async (req, res) => {
  try {
    await useApiService.deleteUser(req.params.id, getAuditMeta(req));
    return res.status(200).json({ message: "Disabled successfully" });
  } catch (e) {
    console.error("deleteUser error:", e);
    return res.status(400).json({ error: e?.message || "Delete Failed" });
  }
};

const readGroups = async (req, res) => {
  try {
    const result = await useApiService.getGroups();
    return res.status(200).json(result);
  } catch (e) {
    console.error("readGroups error:", e);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { readUsers, createUser, updateUser, deleteUser, readGroups };
