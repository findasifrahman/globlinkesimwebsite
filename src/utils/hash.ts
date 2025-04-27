import crypto from 'crypto';

/**
 * Generates an MD5 hash from the provided parameters
 * 
 * @param apiKey - The API key
 * @param pmId - The payment method ID
 * @param amount - The transaction amount
 * @param currency - The currency code
 * @param orderId - The order ID
 * @param secretKey - The secret key for signing
 * @returns The MD5 hash of the concatenated parameters
 */
export function md5sum(
  apiKey: string,
  pmId: string,
  amount: string,
  currency: string,
  orderId: string,
  secretKey: string
): string {
  // Join parameters with pipe character as separator
  const message = [apiKey, pmId, amount, currency, orderId, secretKey].join('|');
  
  // Create MD5 hash
  const hash = crypto.createHash('md5');
  hash.update(message);
  
  // Return hexadecimal digest
  return hash.digest('hex');
}

/**
 * Example usage:
 * 
 * const apiKey = "sandbox_b319fbdd287a0c27";
 * const pmId = "payssion_test";
 * const amount = "1.00";
 * const currency = "USD";
 * const orderId = "123456789";
 * const secretKey = "X3JHi3py7BiXgQ26U2gfsWOHH5WX145Z";
 * 
 * const signature = md5sum(apiKey, pmId, amount, currency, orderId, secretKey);
 * console.log(signature);
 */ 