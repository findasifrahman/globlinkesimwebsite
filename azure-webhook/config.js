require('dotenv').config({ path: '../.env.local' });

module.exports = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Redtea Mobile API
  REDTEA_API_URL: process.env.REDTEA_API_URL || 'https://api.redteamobile.com',
  REDTEA_ACCESS_KEY: process.env.REDTEA_ACCESS_KEY,
  ESIM_SECRET_KEY: process.env.ESIM_SECRET_KEY,
  ESIM_WEBHOOK_SECRET: process.env.ESIM_WEBHOOK_SECRET,
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@globlink.com',
  
  // Server
  PORT: process.env.PORT || 7071,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
}; 