// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract VotingApplication {
    // Structure to represent a candidate
    struct Candidate {
        string name;
        uint voteCount;
    }

    // Structure to represent a voter
    struct Voter {
        bool hasVoted;
        uint votedCandidateId;
    }

    // Array of candidates
    Candidate[] public candidates;

    // Mapping to store the voters by their address
    mapping(address => Voter) public voters;

    // Flag to indicate if voting is closed
    bool public votingClosed;

    // Modifier to check if voting is open
    modifier votingOpen() {
        require(!votingClosed, "Voting is closed.");
        _;
    }

    // Function to add a candidate
    function addCandidate(string memory _name) public votingOpen {
        candidates.push(Candidate(_name, 0));
    }

    // Function to register a voter by their address
    function registerVoter(address _voterAddress) public votingOpen {
        require(!voters[_voterAddress].hasVoted, "Voter has already voted.");

        voters[_voterAddress].hasVoted = false;
        voters[_voterAddress].votedCandidateId = 0;
    }

    // Function to vote for a candidate
    function vote(uint _candidateId) public votingOpen {
        require(!voters[msg.sender].hasVoted, "You have already voted.");
        require(_candidateId < candidates.length, "Invalid candidate ID.");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;

        candidates[_candidateId].voteCount++;
    }

    // Function to close voting (can only be called by the contract owner)
    function closeVoting() public {
        require(!votingClosed, "Voting is already closed.");
        votingClosed = true;
    }

    // Function to get the total number of candidates
    function getCandidateCount() public view returns (uint) {
        return candidates.length;
    }

   /* // Function to get the details of a candidate by ID
    function getCandidate(uint _candidateId) public view returns (string memory, uint) {
        require(_candidateId < candidates.length, "Invalid candidate ID.");

        Candidate memory candidate = candidates[_candidateId];
        return (candidate.name, candidate.voteCount);
    } */

    // Function to get the winner
function getWinner() public view returns (string memory, uint) {
    require(votingClosed, "Voting is still ongoing.");
    require(candidates.length > 0, "No candidates registered.");

    uint winningVoteCount = 0;
    uint winningCandidateId;

    for (uint i = 0; i < candidates.length; i++) {
        if (candidates[i].voteCount > winningVoteCount) {
            winningVoteCount = candidates[i].voteCount;
            winningCandidateId = i;
        }
    }

    return (candidates[winningCandidateId].name, winningVoteCount);
}

// Function to get the names of all candidates
    function getCandidateNames() public view returns (string[] memory) {
        string[] memory candidateNames = new string[](candidates.length);

        for (uint i = 0; i < candidates.length; i++) {
            candidateNames[i] = candidates[i].name;
        }

        return candidateNames;
    }
}
