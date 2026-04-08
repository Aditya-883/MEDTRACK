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

    mapping(address => mapping(address => bool)) private doctorAccess;

    mapping(address => address[]) private authorizedDoctors;

    event RecordUploaded(
        address indexed patient,
        string ipfsHash,
        uint256 timestamp,
        string fileType,
        string fileName
    );

    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    modifier onlyPatient(address patient) {
        require(msg.sender == patient, "Only patient can perform this action");
        _;
    }

    modifier onlyAuthorizedDoctor(address patient) {
        require(doctorAccess[patient][msg.sender], "Doctor not authorized");
        _;
    }

    function uploadRecord(
        address patient,
        string memory ipfsHash,
        string memory fileType,
        string memory fileName
    ) public onlyPatient(patient) {
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");
        require(bytes(fileType).length > 0, "File type required");
        require(bytes(fileName).length > 0, "File name required");

        Record memory newRecord = Record({
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            uploadedBy: msg.sender,
            fileType: fileType,
            fileName: fileName
        });

        patientRecords[patient].push(newRecord);

        emit RecordUploaded(
            patient,
            ipfsHash,
            block.timestamp,
            fileType,
            fileName
        );
    }

    function grantAccess(address doctor) public {
        require(doctor != address(0), "Invalid doctor address");

        if (!doctorAccess[msg.sender][doctor]) {
            authorizedDoctors[msg.sender].push(doctor);
        }

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
