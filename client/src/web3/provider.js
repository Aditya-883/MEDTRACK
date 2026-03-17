import { ethers } from "ethers";

export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error("MetaMask not installed");
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};