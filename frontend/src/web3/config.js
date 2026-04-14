/** Smart contract address — set in frontend/.env as VITE_CONTRACT_ADDRESS */
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

/** Sepolia network config — all values driven by frontend/.env */
export const NETWORK = {
  chainId: import.meta.env.VITE_CHAIN_ID,
  chainName: import.meta.env.VITE_CHAIN_NAME,
  rpcUrls: [import.meta.env.VITE_RPC_URL],
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: [import.meta.env.VITE_EXPLORER_URL],
};
