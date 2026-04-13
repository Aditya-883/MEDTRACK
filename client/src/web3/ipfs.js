import axios from "axios";

// Store your Pinata keys in client/.env.local
// NEXT_PUBLIC_PINATA_API_KEY=...
// NEXT_PUBLIC_PINATA_SECRET_KEY=...
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "ff0122df07abc8937d11";
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "03dff588a9bed07b63938bf680cb8cfaf360470cb70c6a36741ec5bb71644bd3";

export const uploadToIPFS = async (file) => {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);

  // Optional: add metadata
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: file.name, keyvalues: { app: "MedTrack" } })
  );

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    const hash = res.data.IpfsHash;
    console.log("✅ IPFS upload success:", hash);
    return hash;
  } catch (err) {
    console.error("❌ IPFS upload error:", err.response?.data || err.message);
    throw new Error("IPFS upload failed: " + (err.response?.data?.error?.details || err.message));
  }
};
