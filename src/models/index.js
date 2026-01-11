"use strict";

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

const basename = path.basename(__filename);
const db = {};

// ✅ DÙNG 1 SEQUELIZE DUY NHẤT (Aiven/Render) - ƯU TIÊN DB_URL
const DB_URL = process.env.DB_URL;
const DB_DIALECT = process.env.DB_DIALECT || "mysql";

// Support MYSQL_* (nếu bạn đang set theo kiểu MYSQL_HOST...)
const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

// Support DB_* / DB_USERNAME
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
const DB_USER = process.env.DB_USER || process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// SSL (Aiven yêu cầu)
const sslOptions = {
  ssl: { require: true, rejectUnauthorized: false },
};

let sequelize;

if (DB_URL && DB_URL.trim()) {
  sequelize = new Sequelize(DB_URL, {
    dialect: DB_DIALECT,
    logging: false,
    dialectOptions: sslOptions,
  });
} else {
  const host = MYSQL_HOST || DB_HOST || "localhost";
  const port = MYSQL_PORT || DB_PORT || 3306;
  const user = MYSQL_USER || DB_USER || "root";
  const pass = MYSQL_PASSWORD || DB_PASSWORD || "";
  const name = MYSQL_DATABASE || DB_NAME || "flower";

  sequelize = new Sequelize(name, user, pass, {
    host,
    port,
    dialect: DB_DIALECT,
    logging: false,
    dialectOptions: sslOptions,
  });
}

// ✅ Đọc tất cả file .js trong thư mục models (bao gồm cả subfolders)
const readModels = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      readModels(fullPath);
    } else if (file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js") {
      const model = require(fullPath)(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    }
  });
};

readModels(__dirname);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
