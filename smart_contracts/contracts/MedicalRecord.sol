// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalRecord {
    struct Record {
        string ipfsHash;
        uint256 timestamp;
        address uploadedBy;
        string fileType;
        string fileName;
    }

    mapping(address => Record[]) private patientRecords;

    // patient => doctor => access
    mapping(address => mapping(address => bool)) private doctorAccess;

    // patient => list of doctors
    mapping(address => address[]) private authorizedDoctors;

    // Event
    event RecordUploaded(
        address indexed patient,
        string ipfsHash,
        uint256 timestamp,
        string fileType,
        string fileName
    );

    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    // modifier
    modifier onlyPatient(address patient) {
        require(msg.sender == patient, "Only patient allowed");
        _;
    }

    modifier onlyAuthorizedDoctor(address patient) {
        require(doctorAccess[patient][msg.sender], "Not authorized");
        _;
    }

    // to upload record
    function uploadRecord(
        address patient,
        string memory ipfsHash,
        string memory fileType,
        string memory fileName
    ) public onlyPatient(patient) {
        require(bytes(ipfsHash).length > 0, "Invalid IPFS");
        require(bytes(fileType).length > 0, "File type required");
        require(bytes(fileName).length > 0, "File name required");

        patientRecords[patient].push(
            Record({
                ipfsHash: ipfsHash,
                timestamp: block.timestamp,
                uploadedBy: msg.sender,
                fileType: fileType,
                fileName: fileName
            })
        );

        emit RecordUploaded(
            patient,
            ipfsHash,
            block.timestamp,
            fileType,
            fileName
        );
    }

    // access control
    function grantAccess(address doctor) public {
        require(doctor != address(0), "Invalid doctor");

        // prevent duplicate
        if (!doctorAccess[msg.sender][doctor]) {
            authorizedDoctors[msg.sender].push(doctor);
            doctorAccess[msg.sender][doctor] = true;

            emit AccessGranted(msg.sender, doctor);
        }
    }

    function revokeAccess(address doctor) public {
        require(doctorAccess[msg.sender][doctor], "Already revoked");

        // 1️⃣ Remove access mapping
        doctorAccess[msg.sender][doctor] = false;

        // 2️⃣ Remove from array (IMPORTANT FIX)
        address[] storage docs = authorizedDoctors[msg.sender];

        for (uint i = 0; i < docs.length; i++) {
            if (docs[i] == doctor) {
                docs[i] = docs[docs.length - 1]; // swap
                docs.pop(); // remove last
                break;
            }
        }

        emit AccessRevoked(msg.sender, doctor);
    }

    // To view
    function viewRecords(
        address patient
    ) public view onlyAuthorizedDoctor(patient) returns (Record[] memory) {
        return patientRecords[patient];
    }

    function viewMyRecords() public view returns (Record[] memory) {
        return patientRecords[msg.sender];
    }

    function checkAccess(
        address patient,
        address doctor
    ) public view returns (bool) {
        return doctorAccess[patient][doctor];
    }

    function getAuthorizedDoctors(
        address patient
    ) public view returns (address[] memory) {
        return authorizedDoctors[patient];
    }
}
