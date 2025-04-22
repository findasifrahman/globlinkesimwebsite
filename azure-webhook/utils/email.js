const nodemailer = require('nodemailer');
const config = require('../config');

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

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @returns {Promise} - Resolves when email is sent
 */
async function sendEmail(options) {
  console.log(`[Email] Sending email to: ${options.to}`);
  console.log(`[Email] Subject: ${options.subject}`);
  
  try {
    const info = await transporter.sendMail({
      from: config.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    
    console.log(`[Email] Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email] Failed to send email:`, error);
    throw error;
  }
}

module.exports = {
  sendEmail,
}; 