// be/src/config/connectDB.js
const { Sequelize } = require("sequelize");

/**
 * Ưu tiên:
 * 1) DB_URL (khuyên dùng với Aiven)
 * 2) MYSQL_* (nếu bạn set theo kiểu MYSQL_HOST/MYSQL_PORT...)
 * 3) DB_* (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME)
 * 4) fallback local
 */

const DB_URL = process.env.DB_URL;

const DB_DIALECT = process.env.DB_DIALECT || "mysql";

// Support cả MYSQL_* (như bạn đang set trên Render)
const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : undefined;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

// Support DB_* và DB_USERNAME/DB_USER
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
const DB_USER = process.env.DB_USER || process.env.DB_USERNAME; // <- nhận cả 2 key
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// SSL: Aiven yêu cầu SSL
const sslOptions = {
  ssl: { require: true, rejectUnauthorized: false },
};

let sequelize;

// 1) DB_URL (khuyên dùng nhất)
if (DB_URL && DB_URL.trim()) {
  sequelize = new Sequelize(DB_URL, {
    dialect: DB_DIALECT,
    logging: false,
    dialectOptions: sslOptions,
  });
} else {
  // 2) MYSQL_* (Render đang dùng)
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

const connection = async () => {
  try {
    // Debug nhẹ để biết nó đang lấy config nào (không in password)
    console.log("DB config:", {
      usingDBURL: Boolean(DB_URL && DB_URL.trim()),
      dialect: DB_DIALECT,
      host: sequelize?.config?.host,
      port: sequelize?.config?.port,
      database: sequelize?.config?.database,
    });

    await sequelize.authenticate();
    console.log("✅ DB Connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
};

module.exports = connection;

// Nếu bạn cần dùng sequelize ở nơi khác:
// module.exports = { connection, sequelize };
