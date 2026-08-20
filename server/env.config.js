require('dotenv/config')

module.exports = {
  port: Number(process.env.PORT || 3000),
  environment: process.env.ENVIRONMENT || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'kanji',
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    expirationSeconds: Number(process.env.JWT_EXPIRATION_SECONDS || 604800),
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
}
