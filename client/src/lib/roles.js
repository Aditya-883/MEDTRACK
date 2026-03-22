export const ROLES = {
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266": "admin",
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8": "doctor",
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc": "patient"
}

export const getRole = (address) => {
  if (!address) return null;
  return ROLES[address.toLowerCase()] || null;
};