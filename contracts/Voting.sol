
/*
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public owner;
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;
    mapping(address => bool) public voters;
    address[] public voterAddresses;

    event Voted(address indexed voter, uint256 indexed candidateId);
    event VotingEnded(string winnerName, uint256 winnerVoteCount);
    event VotingReset();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidates[candidatesCount] = Candidate(_name, 0);
        candidatesCount++;
    }

    function vote(uint256 _candidateId) public {
        require(!voters[msg.sender], "You have already voted!");
        require(_candidateId < candidatesCount, "Invalid candidate!");

        candidates[_candidateId].voteCount++;
        voters[msg.sender] = true;
        voterAddresses.push(msg.sender);

        emit Voted(msg.sender, _candidateId);
    }


    function endVotingAndDeclareWinner() public onlyOwner {
        require(candidatesCount > 0, "No candidates!");

        uint256 maxVotes = 0;
        uint256 winnerId = 0;
        for (uint256 i = 0; i < candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }
        string memory winnerName = candidates[winnerId].name;

        emit VotingEnded(winnerName, maxVotes);

        for (uint256 i = 0; i < candidatesCount; i++) {
            delete candidates[i];
        }
        candidatesCount = 0;

        for (uint256 i = 0; i < voterAddresses.length; i++) {
            delete voters[voterAddresses[i]];
        }
        delete voterAddresses;


        emit VotingReset();
    }


    function getCandidate(uint256 _candidateId) public view returns (string memory, uint256) {
        require(_candidateId < candidatesCount, "Invalid candidate!");
        Candidate storage c = candidates[_candidateId];
        return (c.name, c.voteCount);
    }
}


*/



pragma solidity ^0.8.20;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public owner;
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;
    uint256 public count;
    mapping(address => bool) public voters;
    mapping(uint => string) public encryptedSums;
    address[] public voterAddresses;

    event Voted(address indexed voter, uint256 indexed candidateId);
    event VotingEnded(string winnerName, uint256 winnerVoteCount);
    event VotingReset();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(uint256 cnt) {
        owner = msg.sender;
        candidatesCount = cnt;
        
        for (uint i = 0; i < candidatesCount; i++) {
            encryptedSums[i] = "1"; // neutral element for Paillier encryption
        }
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidates[count] = Candidate(_name, 0);
        count++;
    }

    function vote(string[] memory encryptedVoteVector) public {
        require(!voters[msg.sender], "You have already voted!");
        // require(_candidateId < candidatesCount, "Invalid candidate!");

        // candidates[_candidateId].voteCount++;
        // voters[msg.sender] = true;
        // voterAddresses.push(msg.sender);

        // emit Voted(msg.sender, _candidateId);

        require(encryptedVoteVector.length == candidatesCount, "Invalid vector");

        for (uint i = 0; i < candidatesCount; i++) {
            encryptedSums[i] = string(abi.encodePacked(encryptedSums[i], "*", encryptedVoteVector[i]));
        }
        voters[msg.sender] = true;
        voterAddresses.push(msg.sender);
    }


    function endVotingAndDeclareWinner() public onlyOwner {
        require(candidatesCount > 0, "No candidates!");

        uint256 maxVotes = 0;
        uint256 winnerId = 0;
        for (uint256 i = 0; i < candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }
        string memory winnerName = candidates[winnerId].name;

        emit VotingEnded(winnerName, maxVotes);

        for (uint256 i = 0; i < candidatesCount; i++) {
            delete candidates[i];
        }
        candidatesCount = 0;

        for (uint256 i = 0; i < voterAddresses.length; i++) {
            delete voters[voterAddresses[i]];
        }
        delete voterAddresses;


        emit VotingReset();
    }


    function getAllEncryptedSums() public view returns (string[] memory) {
    string[] memory allSums = new string[](candidatesCount);
    for (uint i = 0; i < candidatesCount; i++) {
        allSums[i] = encryptedSums[i];
    }
    return allSums;
    }


    function getCandidate(uint256 _candidateId) public view returns (string memory, uint256) {
        require(_candidateId < candidatesCount, "Invalid candidate!");
        Candidate storage c = candidates[_candidateId];
        return (c.name, c.voteCount);
    }
}
