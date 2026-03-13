require('dotenv').config();

// Preferir DATABASE_URL/RAILWAY_DATABASE_URL para o Sequelize CLI
const URL_RAW = process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL;
const URL = URL_RAW ? URL_RAW.replace(/\s+/g, "") : "";
if (URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = URL;
}

module.exports = {
  development: {
    ...(process.env.DATABASE_URL
      ? {
          use_env_variable: 'DATABASE_URL',
          dialect: process.env.DB_DIALECT || 'postgres',
          logging: false,
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
          pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
          },
        }
      : {
          dialect: process.env.DB_DIALECT || 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          database: process.env.DB_NAME,
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          logging: false,
          searchPath: 'public',
          schema: 'public',
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
          pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
          },
          define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
          },
        }),
  },
  test: {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    logging: false,
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_bin',
    },
  },
  production: {
    ...(process.env.DATABASE_URL
      ? {
          use_env_variable: 'DATABASE_URL',
          dialect: process.env.DB_DIALECT || 'postgres',
          logging: false,
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
          pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
          },
          define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
          },
        }
      : {
          dialect: process.env.DB_DIALECT || 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          database: process.env.DB_NAME,
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          logging: false,
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
          pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
          },
          define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
          },
        }),
  },
};
