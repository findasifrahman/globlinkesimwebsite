const fetch = require('node-fetch');
const crypto = require('crypto');
const config = require('../config');

// Redtea Mobile API configuration
const API_URL = config.REDTEA_API_URL || 'https://api.esimaccess.com/api/v1/open/esim/query';
const ACCESS_KEY = config.REDTEA_ACCESS_KEY;
const SECRET_KEY = config.REDTEA_SECRET_KEY;

/**
 * Generate HMAC signature for Redtea Mobile API
 * @param {string} timestamp - Current timestamp in ISO format
 * @param {string} body - Request body as string
 * @returns {string} - HMAC signature
 */
function generateHmacSignature(timestamp, body) {
  const message = `${timestamp}${body}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(message);
  return hmac.digest('hex');
}

/**
 * Query eSIM profile information from Redtea Mobile API
 * @param {string} orderNo - Order number
 * @param {string} iccid - ICCID (optional)
 * @returns {Promise<Object>} - API response
 */
async function queryEsimProfile(orderNo, iccid = '') {
  try {
    const timestamp = new Date().toISOString();
    const requestBody = {
      orderNo,
      iccid,
      pager: {
        pageNum: 1,
        pageSize: 20
      }
    };
    
    const bodyString = JSON.stringify(requestBody);
    const signature = generateHmacSignature(timestamp, bodyString);
    
    console.log(`[Redtea API] Querying eSIM profile for order: ${orderNo}`);
    console.log(`[Redtea API] API URL: ${API_URL}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': ACCESS_KEY,
        'X-Timestamp': timestamp,
        'X-Signature': signature
      },
      body: bodyString
    });
    
    if (!response.ok) {
      console.error(`[Redtea API] Request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[Redtea API] Successfully retrieved eSIM profile for order: ${orderNo}`);
    return data;
  } catch (error) {
    console.error('[Redtea API] Error querying eSIM profile:', error);
    throw error;
  }
}

/**
 * Get QR code URL for an eSIM order
 * @param {string} orderNo - Order number
 * @returns {Promise<string|null>} - QR code URL or null if not found
 */
async function getQrCodeUrl(orderNo) {
  try {
    const response = await queryEsimProfile(orderNo);
    
    if (response.success && response.obj && response.obj.esimList && response.obj.esimList.length > 0) {
      const esimProfile = response.obj.esimList[0];
      return esimProfile.qrCodeUrl || null;
    }
    
    return null;
  } catch (error) {
    console.error('[Redtea API] Error getting QR code URL:', error);
    return null;
  }
}

/**
 * Get complete eSIM profile information
 * @param {string} orderNo - Order number
 * @returns {Promise<Object|null>} - eSIM profile information or null if not found
 */
async function getEsimProfile(orderNo) {
  try {
    const response = await queryEsimProfile(orderNo);
    
    if (response.success && response.obj && response.obj.esimList && response.obj.esimList.length > 0) {
      return response.obj.esimList[0];
    }
    
    return null;
  } catch (error) {
    console.error('[Redtea API] Error getting eSIM profile:', error);
    return null;
  }
}

module.exports = {
  queryEsimProfile,
  getQrCodeUrl,
  getEsimProfile
}; 