import { generateHmacSignature } from './auth';

describe('generateHmacSignature', () => {
  it('should generate a valid HMAC-SHA256 signature', () => {
    // Test inputs
    const timestamp = '1621234567890';
    const requestId = 'req123456';
    const accessCode = 'ACC123456';
    const requestBody = JSON.stringify({ key: 'value' });
    const secretKey = 'mySecretKey123';

    // Generate signature
    const signature = generateHmacSignature(
      timestamp,
      requestId,
      accessCode,
      requestBody,
      secretKey
    );

    // Verify signature properties
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
    expect(signature.length).toBe(64); // SHA256 produces 64 hex characters
    expect(signature).toMatch(/^[0-9a-f]+$/); // Should be lowercase hex
  });

  it('should produce consistent signatures for the same inputs', () => {
    // Test inputs
    const timestamp = '1621234567890';
    const requestId = 'req123456';
    const accessCode = 'ACC123456';
    const requestBody = JSON.stringify({ key: 'value' });
    const secretKey = 'mySecretKey123';

    // Generate signatures twice
    const signature1 = generateHmacSignature(
      timestamp,
      requestId,
      accessCode,
      requestBody,
      secretKey
    );
    
    const signature2 = generateHmacSignature(
      timestamp,
      requestId,
      accessCode,
      requestBody,
      secretKey
    );

    // Verify signatures are identical
    expect(signature1).toBe(signature2);
  });

  it('should produce different signatures for different inputs', () => {
    // Test inputs
    const timestamp = '1621234567890';
    const requestId = 'req123456';
    const accessCode = 'ACC123456';
    const requestBody = JSON.stringify({ key: 'value' });
    const secretKey = 'mySecretKey123';

    // Generate signature with original inputs
    const originalSignature = generateHmacSignature(
      timestamp,
      requestId,
      accessCode,
      requestBody,
      secretKey
    );
    
    // Generate signature with modified timestamp
    const modifiedSignature = generateHmacSignature(
      '1621234567891', // Different timestamp
      requestId,
      accessCode,
      requestBody,
      secretKey
    );

    // Verify signatures are different
    expect(originalSignature).not.toBe(modifiedSignature);
  });
}); 