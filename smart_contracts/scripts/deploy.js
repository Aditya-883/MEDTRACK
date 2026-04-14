const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying MedicalRecord contract to", hre.network.name, "...");

  const MedicalRecord = await hre.ethers.getContractFactory("MedicalRecord");
  const contract = await MedicalRecord.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("✅ MedicalRecord deployed to:", address);
  console.log("\n📝 Update your client/src/web3/config.js:");
  console.log(`   CONTRACT_ADDRESS = "${address}"`);
  console.log("\n📝 Update your client/src/web3/config.js NETWORK section:");
  console.log("   chainId: '0xaa36a7' (Sepolia)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
