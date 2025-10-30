'use strict';

// Load exactly one env file: .env.test when NODE_ENV=test, otherwise .env
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: envFile, override: true });

// Shared base config with sensible defaults; environments can override below.
const base = (overrides = {}) => ({
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nephslair',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  dialect: process.env.DB_DIALECT || 'mysql',
  timezone: 'Z', // use UTC to avoid timezone drift in tests/deploys
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  pool: { max: 5, min: 0, idle: 10000, acquire: 60000 },
  ...overrides,
});

module.exports = {
  development: base({
    database: process.env.DB_NAME || 'nephslair_dev',
    // set DB_LOGGING=true in .env if you want to see SQL logs locally
  }),
  test: base({
    // On GitHub Actions, connect to the MySQL service by its container name
    host: process.env.DB_HOST || 'mysql',
    database: process.env.DB_NAME || 'nephslair_test',
    logging: false,
    // keep the pool small and run Jest with --runInBand for stability
    pool: { max: 1, min: 0, idle: 10000, acquire: 60000 },
  }),
  production: base({
    database: process.env.DB_NAME, // required in prod; no default
    logging: false,
    // If your managed DB requires TLS, uncomment and adjust:
    // dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  }),
};