const SECRET_KEY = "medtrack-secret-key";

// 🔐 Encrypt
export const encryptData = (data) => {
  try {
    return btoa(data + SECRET_KEY);
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
};

// 🔓 Decrypt
export const decryptData = (encrypted) => {
  try {
    const decoded = atob(encrypted);
    return decoded.replace(SECRET_KEY, "");
  } catch (err) {
    console.error("Decryption error:", err);
    return "Decryption failed";
  }
};