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

    event Voted(address indexed voter, uint256 indexed candidateId);

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

        emit Voted(msg.sender, _candidateId);
    }

    function getCandidate(uint256 _candidateId) public view returns (string memory, uint256) {
        require(_candidateId < candidatesCount, "Invalid candidate!");
        return (candidates[_candidateId].name, candidates[_candidateId].voteCount);
    }
}
