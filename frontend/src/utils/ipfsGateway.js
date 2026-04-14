const GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

export function getIPFSUrl(hash) {
  if (!hash) return '';
  if (hash.startsWith('http')) return hash;
  return `${GATEWAYS[0]}${hash}`;
}

export async function getWorkingIPFSUrl(hash) {
  for (const gateway of GATEWAYS) {
    const url = `${gateway}${hash}`;
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (res.ok) return url;
    } catch {
      console.warn('Gateway failed:', gateway);
    }
  }
  throw new Error('All IPFS gateways failed');
}
