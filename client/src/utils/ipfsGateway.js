const GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://dweb.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/"
];

// Try loading from multiple gateways
export function getIPFSUrl(hash) {
  return `${GATEWAYS[0]}${hash}`;
}

//  fallback (auto-switch)
export async function getWorkingIPFSUrl(hash) {
  for (let gateway of GATEWAYS) {
    const url = `${gateway}${hash}`;

    try {
      const res = await fetch(url, { method: "HEAD" });

      if (res.ok) {
        return url;
      }
    } catch (err) {
      console.warn("Gateway failed:", gateway);
    }
  }

  throw new Error("All IPFS gateways failed");
}