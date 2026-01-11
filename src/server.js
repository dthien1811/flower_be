// be/src/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const connection = require("./config/connectDB"); // ✅ giờ là function
const flowerRoute = require("./routes/flower");

const app = express();
const PORT = process.env.PORT || 8080;
const HOSTNAME = process.env.HOSTNAME || "localhost";

// parsers
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// health
app.get("/health", (req, res) => res.json({ ok: true }));

// API
app.use("/api/flowers", flowerRoute);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

// start
(async () => {
  await connection(); // ✅ giờ gọi được
  app.listen(PORT, () => console.log(`✅ Server running at: http://${HOSTNAME}:${PORT}`));
})();
