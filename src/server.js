// be/src/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const connection = require("./config/connectDB");
const flowerRoute = require("./routes/flower");

const app = express();
const PORT = process.env.PORT || 8080;

// ==================
// MIDDLEWARE
// ==================
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ==================
// CORS – CHẠY ĐƯỢC LOCAL + VERCEL
// ==================
const allowlist = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://flower-eta-sage.vercel.app", // domain FE Vercel của bạn
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowlist.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization, Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// ==================
// ROUTES
// ==================
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/flowers", flowerRoute);

// ==================
// 404 & ERROR
// ==================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ==================
// START SERVER
// ==================
(async () => {
  try {
    await connection();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
})();
