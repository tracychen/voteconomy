import { createTransaction } from "../utils/biconomy";
import { voteContract } from "../utils/env";

export async function createProposal(name: string, description: string) {
  const tx = await voteContract.populateTransaction.propose(name, description);
  console.log(tx);
  const receipt = await createTransaction([tx]);

  return receipt?.transactionHash;
}

export async function getProposals() {
  console.log("Getting proposals...");
  const proposals = await voteContract.getAllProposals();
  return proposals.map((proposal) => {
    return {
      name: proposal.name,
      description: proposal.description,
      proposer: proposal.proposer,
      yesVotes: proposal.yesVotes.toNumber(),
      noVotes: proposal.noVotes.toNumber(),
      abstainVotes: proposal.abstainVotes.toNumber(),
    };
  });
}

export async function getProposal(id: number) {
  const proposal = await voteContract.proposals(id);
  return {
    name: proposal.name,
    description: proposal.description,
    proposer: proposal.proposer,
    yesVotes: proposal.yesVotes.toNumber(),
    noVotes: proposal.noVotes.toNumber(),
    abstainVotes: proposal.abstainVotes.toNumber(),
  };
}
