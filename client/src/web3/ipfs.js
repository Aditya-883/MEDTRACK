import axios from "axios";

const PINATA_API_KEY = "ff0122df07abc8937d11";
const PINATA_SECRET_API_KEY = "03dff588a9bed07b63938bf680cb8cfaf360470cb70c6a36741ec5bb71644bd3";

export const uploadToIPFS = async (file) => {
  try {
    if (!file) throw new Error("No file provided");

    const formData = new FormData();
    formData.append("file", file); // ✅ REAL FILE upload

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    const hash = res.data.IpfsHash;

    console.log("✅ REAL IPFS HASH:", hash);
    alert("Uploaded to IPFS:\n" + hash);

    return hash;
  } catch (err) {
    console.error("❌ IPFS ERROR:", err);
    throw new Error("IPFS upload failed");
  }
};
