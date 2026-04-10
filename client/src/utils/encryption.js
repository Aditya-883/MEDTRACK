const SECRET_KEY = "medtrack-secret-key";

//  Encrypt (URL SAFE)
export const encryptData = (data) => {
  try {
    const raw = String(data) + SECRET_KEY;
    return btoa(raw)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, ""); // remove padding
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
};

//  Decrypt
export const decryptData = (encrypted) => {
  try {
    let base64 = encrypted
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    // restore padding
    while (base64.length % 4) {
      base64 += "=";
    }

    const decoded = atob(base64);
    return decoded.replace(SECRET_KEY, "");
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
};