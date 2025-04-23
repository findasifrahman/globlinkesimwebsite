const express = require('express');
const crypto = require('crypto');
const config = require('./config');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const { sendEmail } = require('./utils/email');
const handleWebhook = require('./webhook');

// Initialize Express app
const app = express();
const port = process.env.PORT || 7071;

// Initialize Prisma client
const prisma = new PrismaClient();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD,
  },
});

// Middleware to parse JSON bodies
app.use(express.json());

// Webhook endpoint
app.post('/globlinkesimwebhook', async (req, res) => {
  console.log('==================================================');
  console.log('[Webhook] Received webhook request at:', new Date().toISOString());
  console.log('[Webhook] Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Process the webhook
    await handleWebhook(req, res);
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`[Server] Webhook server listening on port ${port}`);
  console.log(`[Server] Webhook URL: http://localhost:${port}/globlinkesimwebhook`);
});

// Export the app for testing
module.exports = app; 