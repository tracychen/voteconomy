"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { SessionKeyManagerModule } from "@biconomy/modules";
import { BiconomySmartAccountV2 } from "@biconomy/account";
import { DEFAULT_SESSION_KEY_MANAGER_MODULE } from "@biconomy/modules";
import { chainConfigs, chainId, voteContract } from "../utils/env";
import { paymaster } from "../utils/biconomy";
import { PaymasterMode } from "@biconomy/paymaster";
import { getProposals } from "../services/proposals";
import Proposal from "./Proposal";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";
import CreateProposal from "./CreateProposal";
import { Separator } from "./ui/separator";

interface props {
  smartAccount: BiconomySmartAccountV2;
  provider: ethers.providers.JsonRpcProvider;
  address: string;
}

const Vote: React.FC<props> = ({ smartAccount, provider, address }) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const { toast } = useToast();

  const updateProposals = async () => {
    const proposals = await getProposals();
    console.log("proposals", proposals);
    setProposals(proposals);
  };

  useEffect(() => {
    updateProposals();
  }, []);

  const vote = async (proposalId: number, voteType: number) => {
    if (!address || !smartAccount || !address) {
      alert("Please connect wallet first");
      return;
    }
    try {
      const getTitle = () => {
        switch (voteType) {
          case 1:
            return "Voting Abstain...";
          case 2:
            return "Voting Yes...";
          case 3:
            return "Voting No...";
          default:
            return "Voting...";
        }
      };
      toast({
        title: getTitle(),
        description: "Please wait while we persist your vote on-chain",
      });
      // get session key from local storage
      const sessionKeyPrivKey = window.localStorage.getItem(
        `${await provider.getSigner().getAddress()}-sessionPKey`
      );
      if (!sessionKeyPrivKey) {
        alert("Session key not found please create session");
        return;
      }
      const sessionSigner = new ethers.Wallet(sessionKeyPrivKey);
      console.log("sessionSigner", sessionSigner);

      // generate sessionModule
      const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
        smartAccountAddress: address,
      });

      // set active module to sessionModule
      smartAccount = smartAccount.setActiveValidationModule(sessionModule);

      const tx = (await voteContract.populateTransaction.vote(
        proposalId,
        voteType
      )) as any;

      // build user op
      let userOp = await smartAccount.buildUserOp([tx], {
        overrides: {
          // signature: "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000456b395c4e107e0302553b90d1ef4a32e9000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000db3d753a1da5a6074a9f74f39a0a779d3300000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000080000000000000000000000000bfe121a6dcf92c49f6c2ebd4f306ba0ba0ab6f1c000000000000000000000000da5289fcaaf71d52a80a254da614a192b693e97700000000000000000000000042138576848e839827585a3539305774d36b96020000000000000000000000000000000000000000000000000000000002faf08000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041feefc797ef9e9d8a6a41266a85ddf5f85c8f2a3d2654b10b415d348b150dabe82d34002240162ed7f6b7ffbc40162b10e62c3e35175975e43659654697caebfe1c00000000000000000000000000000000000000000000000000000000000000"
          // callGasLimit: 2000000, // only if undeployed account
          // verificationGasLimit: 700000
        },
        skipBundlerGasEstimation: false,
        params: {
          sessionSigner: sessionSigner,
          sessionValidationModule:
            chainConfigs[chainId].voteSessionValidationModuleContract,
        },
      });

      const paymasterAndDataResponse = await paymaster.getPaymasterAndData(
        userOp,
        {
          mode: PaymasterMode.SPONSORED,
          smartAccountInfo: {
            name: "BICONOMY",
            version: "2.0.0",
          },
        }
      );
      console.log("paymaster and data response", paymasterAndDataResponse);
      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

      // send user op
      const userOpResponse = await smartAccount.sendUserOp(userOp, {
        sessionSigner: sessionSigner,
        sessionValidationModule:
          chainConfigs[chainId].voteSessionValidationModuleContract,
      });

      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);
      console.log("txHash", receipt.transactionHash);
      toast({
        title: `Successfully voted on proposal ${proposalId}`,
        action: (
          <ToastAction
            altText="View Transaction"
            onClick={() =>
              window.open(
                `${chainConfigs[chainId].blockExplorerUrl}/tx/${receipt.transactionHash}`
              )
            }
          >
            View Transaction
          </ToastAction>
        ),
      });

      await updateProposals();
    } catch (err: any) {
      console.error(err);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <Separator className="my-8" />
      <h2 className="text-xl">Proposals</h2>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <CreateProposal
            smartAccount={smartAccount}
            provider={provider}
            address={address}
            updateProposals={updateProposals}
          />
        </div>
        <div className="flex flex-wrap gap-4 md:w-2/3 lg:w-3/4">
          {proposals.map((proposal, index) => {
            return (
              <Proposal
                key={index}
                id={index}
                proposal={proposal}
                vote={vote}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Vote;
