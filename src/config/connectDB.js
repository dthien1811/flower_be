// be/src/config/connectDB.js
const { Sequelize } = require("sequelize");

// ✅ Dùng ENV trước (để connect Aiven), fallback về local nếu bạn chưa set
const DB_NAME = process.env.DB_NAME || "flower";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || null;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_DIALECT = process.env.DB_DIALECT || "mysql";

// Nếu dùng Aiven thường sẽ có SSL + DB_URL
const DB_URL = process.env.DB_URL; // ví dụ: mysql://user:pass@host:port/dbname

const sequelize = DB_URL
  ? new Sequelize(DB_URL, {
      dialect: DB_DIALECT,
      logging: false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      dialect: DB_DIALECT,
      logging: false,
    });

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB Connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error; // để server biết connect fail
  }
};

// ✅ CommonJS exports
module.exports = connection;

// (Nếu chỗ khác cần sequelize thì export thêm kiểu này và require tương ứng)
// module.exports = { connection, sequelize };
