// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    mapping(address => bool) public voters;
    Candidate[] public candidates;
    address public owner;
    bool public votingClosed;
    uint256 public winningCandidateIndex;

    event VoteCast(address indexed voter, uint256 candidateIndex);
    event VotingClosed(uint256 winningCandidateIndex, string winnerName);

    constructor(string[] memory _candidateNames) {
        owner = msg.sender;
        votingClosed = false;
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action.");
        _;
    }

    modifier votingOpen() {
        require(!votingClosed, "Voting is closed.");
        _;
    }

    function vote(uint256 _candidateIndex) public votingOpen {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateIndex < candidates.length, "Invalid candidate index.");

        voters[msg.sender] = true;
        candidates[_candidateIndex].voteCount++;
        emit VoteCast(msg.sender, _candidateIndex);
    }

    function closeVoting() public onlyOwner {
        require(!votingClosed, "Voting is already closed.");

        votingClosed = true;
        uint256 maxVoteCount = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVoteCount) {
                maxVoteCount = candidates[i].voteCount;
                winningCandidateIndex = i;
            }
        }
        emit VotingClosed(winningCandidateIndex, candidates[winningCandidateIndex].name);
    }

    function getCandidateCount() public view returns (uint256) {
        return candidates.length;
    }

    function getCandidate(uint256 _index) public view returns (string memory, uint256) {
        require(_index < candidates.length, "Invalid candidate index.");

        Candidate memory candidate = candidates[_index];
        return (candidate.name, candidate.voteCount);
    }

    function getContractOwner() public view returns (address) {
        return owner;
    }
}
