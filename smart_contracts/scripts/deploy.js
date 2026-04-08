const hre = require("hardhat");

async function main() {

  const MedicalRecord = await hre.ethers.getContractFactory("MedicalRecord");

  const medicalRecord = await MedicalRecord.deploy();

  await medicalRecord.waitForDeployment();

  const address = await medicalRecord.getAddress();

  console.log("======================================");
  console.log("MedicalRecord deployed successfully!");
  console.log("Contract Address:", address);
  console.log("======================================");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});