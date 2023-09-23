import { createTransaction } from "../utils/biconomy";
import { voteContract } from "../utils/env";

export async function submiteVote(proposalId: number, voteType: number) {
  const tx = await voteContract.populateTransaction.vote(proposalId, voteType);

  const receipt = await createTransaction([tx]);

  return receipt?.transactionHash;
}
