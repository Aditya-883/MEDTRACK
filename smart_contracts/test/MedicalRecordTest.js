const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalRecord Contract", function () {

  let medicalRecord;
  let patient;
  let doctor;

  beforeEach(async function () {

    const MedicalRecord = await ethers.getContractFactory("MedicalRecord");

    const accounts = await ethers.getSigners();

    patient = accounts[0];
    doctor = accounts[1];

    medicalRecord = await MedicalRecord.deploy();
    await medicalRecord.waitForDeployment();

  });

  it("Patient can upload a medical record", async function () {

    const ipfsHash = "QmTestHash123";

    await medicalRecord
      .connect(patient)
      .uploadRecord(patient.address, ipfsHash);

    const records = await medicalRecord
      .connect(patient)
      .viewOwnRecords();

    expect(records.length).to.equal(1);
    expect(records[0].ipfsHash).to.equal(ipfsHash);

  });

  it("Doctor cannot access records without permission", async function () {

    const ipfsHash = "QmTestHash123";

    await medicalRecord
      .connect(patient)
      .uploadRecord(patient.address, ipfsHash);

    await expect(
      medicalRecord
        .connect(doctor)
        .viewRecords(patient.address)
    ).to.be.revertedWith("Doctor not authorized");

  });

  it("Patient can grant doctor access", async function () {

    await medicalRecord
      .connect(patient)
      .grantAccess(doctor.address);

    const ipfsHash = "QmTestHash123";

    await medicalRecord
      .connect(patient)
      .uploadRecord(patient.address, ipfsHash);

    const records = await medicalRecord
      .connect(doctor)
      .viewRecords(patient.address);

    expect(records.length).to.equal(1);

  });

  it("Patient can revoke doctor access", async function () {

    await medicalRecord
      .connect(patient)
      .grantAccess(doctor.address);

    await medicalRecord
      .connect(patient)
      .revokeAccess(doctor.address);

    const ipfsHash = "QmTestHash123";

    await medicalRecord
      .connect(patient)
      .uploadRecord(patient.address, ipfsHash);

    await expect(
      medicalRecord
        .connect(doctor)
        .viewRecords(patient.address)
    ).to.be.revertedWith("Doctor not authorized");

  });

});