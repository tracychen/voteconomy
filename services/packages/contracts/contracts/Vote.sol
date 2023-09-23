// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Vote {
    uint256 public proposalIndex;

    struct Proposal {
        string name;
        string description;
        uint abstainVotes;
        uint yesVotes;
        uint noVotes;
        address proposer;
    }

    enum VoteType {
        None,
        Abstain,
        Yes,
        No
    }

    mapping (address => mapping (uint256 => VoteType)) votes;

    Proposal[] public proposals;

    event ProposalCreated(uint256 proposalIndex, string name, string description, address proposer);
    event Voted(uint256 proposalIndex, address voter, VoteType vote, VoteType previousVote);

    constructor() {
        proposalIndex = 0;
    }

    function propose(string memory proposalName, string memory description) external {
        require(bytes(proposalName).length > 0, "Proposal name cannot be empty.");
        
        proposals.push(Proposal({
            name: proposalName,
            description: description,
            abstainVotes: 0,
            yesVotes: 0,
            noVotes: 0,
            proposer: msg.sender
        }));
        proposalIndex++;

        emit ProposalCreated(proposalIndex, proposalName, description, msg.sender);
    }

    function getAllProposals() external view returns (Proposal[] memory) {
        return proposals;
    }

    function hasVoted(uint256 index, address voter) external view returns (bool) {
        return votes[voter][index] != VoteType.None;
    }

    function vote(uint256 index, VoteType voteType) external {
        require(index < proposalIndex, "Invalid proposal index.");
        require(voteType != VoteType.None, "Invalid vote type.");

        // remove previous vote
        VoteType previousVote = votes[msg.sender][index];
        if (previousVote == VoteType.Abstain) {
            proposals[index].abstainVotes -= 1;
        } else if (previousVote == VoteType.Yes) {
            proposals[index].yesVotes -= 1;
        } else if (previousVote == VoteType.No) {
            proposals[index].noVotes -= 1;
        }

        // update votes 
        votes[msg.sender][index] = voteType;

        if (voteType == VoteType.Abstain) {
            proposals[index].abstainVotes += 1;
        } else if (voteType == VoteType.Yes) {
            proposals[index].yesVotes += 1;
        } else if (voteType == VoteType.No) {
            proposals[index].noVotes += 1;
        }

        emit Voted(index, msg.sender, voteType, previousVote);
    }
}