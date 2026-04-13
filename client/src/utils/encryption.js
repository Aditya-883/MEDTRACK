// Simple obfuscation for IPFS hashes stored on-chain.
// NOTE: For production, use proper AES encryption with a user-derived key.
const SECRET_KEY = "medtrack-secret-2024";

// Encrypt: XOR each char code with secret, then base64url-encode
export const encryptData = (data) => {
  try {
    const str = String(data);
    const key = SECRET_KEY;
    let result = "";
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (err) {
    console.error("Encryption error:", err);
    return data; // fallback: store raw
  }
};

// Decrypt: reverse of encrypt
export const decryptData = (encrypted) => {
  try {
    // Restore base64 padding
    let base64 = encrypted.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";

    const decoded = atob(base64);
    const key = SECRET_KEY;
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (err) {
    console.error("Decryption error:", err);
    return encrypted; // fallback: return raw (handles old unencrypted hashes)
  }
};
