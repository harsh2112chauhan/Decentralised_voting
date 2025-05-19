// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./verifier.sol";
contract Voting is Verifier {
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

    function vote(string[] memory encryptedVoteVector, uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input) public {
        require(!voters[msg.sender], "You have already voted!");

        require(encryptedVoteVector.length == candidatesCount, "Invalid vector");
        Proof memory proof = Proof({
            a: Pairing.G1Point(a[0], a[1]),
            b: Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]),
            c: Pairing.G1Point(c[0], c[1])
        });
        
        require(verifyTx(proof, input), "Invalid zk-SNARK proof!");
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
