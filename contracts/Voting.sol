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

    /// @notice Ends voting, emits the winner + vote count, then resets state.
    function endVotingAndDeclareWinner() public onlyOwner {
        require(candidatesCount > 0, "No candidates!");

        // 1) Find winner
        uint256 maxVotes = 0;
        uint256 winnerId = 0;
        for (uint256 i = 0; i < candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }
        string memory winnerName = candidates[winnerId].name;

        // 2) Emit event with results
        emit VotingEnded(winnerName, maxVotes);

        // 3) Reset all candidates
        for (uint256 i = 0; i < candidatesCount; i++) {
            delete candidates[i];
        }
        candidatesCount = 0;

        // 4) Reset all voter records
        for (uint256 i = 0; i < voterAddresses.length; i++) {
            delete voters[voterAddresses[i]];
        }
        delete voterAddresses;

        // 5) Emit reset notification
        emit VotingReset();
    }

    // view helper if you still need to fetch a candidate post‑reset
    function getCandidate(uint256 _candidateId) public view returns (string memory, uint256) {
        require(_candidateId < candidatesCount, "Invalid candidate!");
        Candidate storage c = candidates[_candidateId];
        return (c.name, c.voteCount);
    }
}
