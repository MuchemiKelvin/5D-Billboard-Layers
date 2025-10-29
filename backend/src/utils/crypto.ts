import crypto from 'crypto';

export interface EncryptionResult {
  algorithm: string;
  iv: string;
  tag: string;
  ciphertext: string;
}

const getKey = (secret?: string): Buffer => {
  const pass = secret || process.env.AUDIT_EXPORT_KEY || '';
  if (!pass) throw new Error('AUDIT_EXPORT_KEY is not configured');
  return crypto.createHash('sha256').update(pass).digest();
};

export const encryptAES256GCM = (data: Buffer | string, secret?: string): EncryptionResult => {
  const key = getKey(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const input = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  const enc = Buffer.concat([cipher.update(input), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    algorithm: 'aes-256-gcm',
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    ciphertext: enc.toString('base64')
  };
};

export const decryptAES256GCM = (payload: EncryptionResult, secret?: string): Buffer => {
  const key = getKey(secret);
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64')),
    decipher.final()
  ]);
  return plaintext;
};



