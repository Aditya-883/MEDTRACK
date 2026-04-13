// Contract address is loaded from .env.local
// Add this line to client/.env.local:
//   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourRealDeployedAddressHere
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0xYOUR_DEPLOYED_CONTRACT_ADDRESS") {
  console.error("❌ CONTRACT_ADDRESS is not set. Add NEXT_PUBLIC_CONTRACT_ADDRESS to client/.env.local");
}

export const NETWORK = {
  chainId: "0xaa36a7", // Sepolia testnet (11155111 in hex)
  chainName: "Sepolia Testnet",
  rpcUrls: ["https://rpc.sepolia.org"],
  nativeCurrency: {
    name: "SepoliaETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};
