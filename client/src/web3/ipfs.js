export const uploadToIPFS = async (file) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  const data = new FormData();
  data.append("file", file);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        pinata_api_key: "ff0122df07abc8937d11",
        pinata_secret_api_key: "03dff588a9bed07b63938bf680cb8cfaf360470cb70c6a36741ec5bb71644bd3" ,
      },
      body: data,
    });

    const result = await res.json();

    return result.IpfsHash;
  } catch (err) {
    console.error("PINATA ERROR:", err);
    throw err;
  }
};