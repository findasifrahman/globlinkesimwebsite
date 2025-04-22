import crypto from 'crypto';

export function generateHmacSignature(path: string, params: string): string {
  const dataToSign = path + params;
  const hmac = crypto.createHmac('sha256', process.env.REDTEA_SECRET_KEY || '');
  hmac.update(dataToSign);
  return hmac.digest('hex').toLowerCase();
} 