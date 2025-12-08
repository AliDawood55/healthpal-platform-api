import crypto from 'crypto';

const KEY = process.env.DATA_ENCRYPTION_KEY;
const ALGO = 'aes-256-gcm';

if (!KEY || KEY.length !== 32) {
    console.warn('[encryption] DATA_ENCRYPTION_KEY must be 32 chars!');
}

export function encrypt(plainText) {
    if (plainText == null) return null;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY), iv);

    let encrypted = cipher.update(String(plainText), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag().toString('base64');

    return `${iv.toString('base64')}:${authTag}:${encrypted}`;
}

export function decrypt(cipherText) {
    if (cipherText == null) return null;

    const [ivB64, tagB64, data] = String(cipherText).split(':');
    if (!ivB64 || !tagB64 || !data) return cipherText;

    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');

    const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
