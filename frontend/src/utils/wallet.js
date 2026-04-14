import { ethers } from 'ethers';
import { NETWORK } from '../web3/config.js';

export const SESSION_TIME = 30 * 60 * 1000; // 30 minutes

export const shortenAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

export async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK.chainId }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [NETWORK],
      });
    } else {
      throw err;
    }
  }
}

export async function connectAndSign() {
  if (!window.ethereum) throw new Error('Please install MetaMask');

  await switchToSepolia();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  const message = `Login to MedTrack at ${new Date().toISOString()}`;
  const signature = await signer.signMessage(message);
  const recovered = ethers.verifyMessage(message, signature);

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Signature verification failed');
  }

  return address;
}
