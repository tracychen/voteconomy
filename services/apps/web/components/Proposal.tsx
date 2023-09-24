import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2 } from "lucide-react";
import { truncateAddress } from "../lib/utils";
import Link from "next/link";
import { chainConfigs, chainId } from "../utils/env";

interface props {
  id: number;
  proposal: any;
  vote: (proposalId: number, voteType: number) => Promise<void>;
}

const Proposal: React.FC<props> = ({ id, proposal, vote }) => {
  const [isVoting, setIsVoting] = useState<boolean>(false);

  async function voteOnProposal(proposalId: number, voteType: number) {
    setIsVoting(true);
    await vote(proposalId, voteType);
    setIsVoting(false);
  }

  const { yesPercentage, noPercentage, abstainPercentage, totalVotes } =
    useMemo(() => {
      const totalVotes =
        proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
      if (totalVotes === 0) {
        return {
          yesPercentage: 0,
          noPercentage: 0,
          abstainPercentage: 0,
          totalVotes: 0,
        };
      }
      const yesPercentage = (proposal.yesVotes / totalVotes) * 100;
      const noPercentage = (proposal.noVotes / totalVotes) * 100;
      const abstainPercentage = (proposal.abstainVotes / totalVotes) * 100;
      return { yesPercentage, noPercentage, abstainPercentage, totalVotes };
    }, [proposal]);

  return (
    <>
      <Card className="w-full md:w-[380px]">
        <CardHeader>
          <CardTitle>{proposal.name}</CardTitle>
          <CardDescription>
            <div className="flex-col gap-1">
              <div>{proposal.description}</div>
              <div className="flex gap-1">
                Proposed by{" "}
                <Link
                  href={`${chainConfigs[chainId].blockExplorerUrl}/address/${proposal.proposer}`}
                  className="underline"
                  target="_blank"
                >
                  {truncateAddress(proposal.proposer)}
                </Link>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <>
            <div>Yes</div>
            <div className="w-full">
              <div className="bg-gray-300 h-4">
                <div
                  className="bg-green-700 h-4"
                  style={
                    {
                      width: `${yesPercentage}%`,
                    } as any
                  }
                ></div>
              </div>
            </div>
            <div>{proposal.yesVotes}</div>
          </>
          <>
            <div>No</div>
            <div className="w-full">
              <div className="bg-gray-300 h-4">
                <div
                  className="bg-red-700 h-4"
                  style={
                    {
                      width: `${noPercentage}%`,
                    } as any
                  }
                ></div>
              </div>
            </div>
            <div>{proposal.noVotes}</div>
          </>
          <>
            <div>Abstain</div>
            <div className="w-full">
              <div className="bg-gray-300 h-4">
                <div
                  className="bg-gray-700 h-4"
                  style={
                    {
                      width: `${abstainPercentage}%`,
                    } as any
                  }
                ></div>
              </div>
            </div>
            <div>{proposal.abstainVotes}</div>
          </>
          <div>Total Votes: {totalVotes}</div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex text-md items-center">
              Vote
              {isVoting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </div>
            <div>
              <Button
                disabled={isVoting}
                className="w-full bg-green-700"
                onClick={async () => await voteOnProposal(id, 2)}
              >
                Yes
              </Button>
            </div>
            <div>
              <Button
                disabled={isVoting}
                className="w-full bg-red-700"
                onClick={async () => await voteOnProposal(id, 3)}
              >
                No
              </Button>
            </div>
            <div>
              <Button
                disabled={isVoting}
                className="w-full bg-gray-700"
                onClick={async () => await voteOnProposal(id, 1)}
              >
                Abstain
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default Proposal;
