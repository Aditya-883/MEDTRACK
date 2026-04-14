// Simple XOR obfuscation for IPFS hashes stored on-chain.
// NOTE: For production, use proper AES encryption with a user-derived key.
const SECRET_KEY = 'medtrack-secret-2024';

export const encryptData = (data) => {
  try {
    const str = String(data);
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(result).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Encryption error:', err);
    return data;
  }
};

export const decryptData = (encrypted) => {
  try {
    let base64 = encrypted.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const decoded = atob(base64);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return result;
  } catch {
    return encrypted; // fallback: return raw (handles old unencrypted hashes)
  }
};
