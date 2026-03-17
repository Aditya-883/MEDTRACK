// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MedicalRecord {
    struct Record {
        string ipfsHash;
        uint256 timestamp;
        address uploadedBy;
    }

    mapping(address => Record[]) private patientRecords;

    mapping(address => mapping(address => bool)) private doctorAccess;

    event RecordUploaded(
        address indexed patient,
        string ipfsHash,
        uint256 timestamp
    );

    event AccessGranted(address indexed patient, address indexed doctor);

    event AccessRevoked(address indexed patient, address indexed doctor);

    modifier onlyPatient(address patient) {
        require(msg.sender == patient, "Not authorized");
        _;
    }

    modifier onlyAuthorizedDoctor(address patient) {
        require(
            doctorAccess[patient][msg.sender] == true,
            "Doctor not authorized"
        );
        _;
    }

    function uploadRecord(
        address patient,
        string memory ipfsHash
    ) public onlyPatient(patient) {
        Record memory newRecord = Record({
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            uploadedBy: msg.sender
        });

        patientRecords[patient].push(newRecord);

        emit RecordUploaded(patient, ipfsHash, block.timestamp);
    }

    function grantAccess(address doctor) public {
        doctorAccess[msg.sender][doctor] = true;

        emit AccessGranted(msg.sender, doctor);
    }

    function revokeAccess(address doctor) public {
        doctorAccess[msg.sender][doctor] = false;

        emit AccessRevoked(msg.sender, doctor);
    }

    function viewRecords(
        address patient
    ) public view onlyAuthorizedDoctor(patient) returns (Record[] memory) {
        return patientRecords[patient];
    }

    function viewOwnRecords() public view returns (Record[] memory) {
        return patientRecords[msg.sender];
    }
}
