require("../bootstrap");

const host = process.env.DB_HOST || "localhost";
const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(host || "");
const hasDatabaseUrl = !!process.env.DATABASE_URL;
const sslFlag = String(process.env.DB_SSL || "").toLowerCase() === "true";
const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";
const sslRequired = sslFlag || isProd || hasDatabaseUrl || !isLocalHost;


// são paulo timezone


module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
    // freezeTableName: true
  },
  options: { requestTimeout: 600000, encrypt: true },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    max: 100
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000
  },
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: process.env.DB_DIALECT === 'sqlite' ? '+00:00' : 'America/Sao_Paulo',
  host: host,
  port: process.env.DB_PORT || "5432",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: isProd ? false : console.log,
  dialectOptions: {
    ssl: sslRequired
      ? {
          require: true,
          rejectUnauthorized: false
        }
      : false,
    keepAlive: true,
    connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT || "20000")
  }
};
