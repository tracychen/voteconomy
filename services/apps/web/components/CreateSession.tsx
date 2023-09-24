"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  SessionKeyManagerModule,
  DEFAULT_SESSION_KEY_MANAGER_MODULE,
} from "@biconomy/modules";
import { BiconomySmartAccountV2 } from "@biconomy/account";
import { defaultAbiCoder } from "ethers/lib/utils";

import { chainConfigs, chainId } from "../utils/env";
import { createTransaction, paymaster } from "../utils/biconomy";
import Vote from "./Vote";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";
import CreateProposal from "./CreateProposal";

interface props {
  smartAccount: BiconomySmartAccountV2;
  address: string;
  provider: ethers.providers.JsonRpcProvider;
}

const CreateSession: React.FC<props> = ({
  smartAccount,
  address,
  provider,
}) => {
  const [isSessionKeyModuleEnabled, setIsSessionKeyModuleEnabled] =
    useState<boolean>(false);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  useEffect(() => {
    // check if session active
    let checkSessionActive = async () => {
      const sessionKeyPrivKey = window.localStorage.getItem(
        `${await provider.getSigner().getAddress()}-sessionPKey`
      );
      if (sessionKeyPrivKey) {
        setIsSessionActive(true);
      }
    };
    checkSessionActive();
  }, []);

  useEffect(() => {
    let checkSessionModuleEnabled = async () => {
      if (!address || !smartAccount || !provider) {
        setIsSessionKeyModuleEnabled(false);
        return;
      }
      try {
        const isEnabled = await smartAccount.isModuleEnabled(
          DEFAULT_SESSION_KEY_MANAGER_MODULE
        );
        console.log("isSessionKeyModuleEnabled", isEnabled);
        setIsSessionKeyModuleEnabled(isEnabled);
        return;
      } catch (err: any) {
        console.error(err);
        setIsSessionKeyModuleEnabled(false);
        return;
      }
    };
    checkSessionModuleEnabled();
  }, [isSessionKeyModuleEnabled, address, smartAccount, provider]);

  const createSession = async (enableSessionKeyModule: boolean) => {
    toast({
      title: "Creating session...",
    });
    if (!address || !smartAccount || !provider) {
      alert("Please connect wallet first");
    }
    try {
      // -----> setMerkle tree tx flow
      // create dapp side session key
      const sessionSigner = ethers.Wallet.createRandom();
      const sessionKeyEOA = await sessionSigner.getAddress();
      console.log("sessionKeyEOA", sessionKeyEOA);
      window.localStorage.setItem(
        `${await provider.getSigner().getAddress()}-sessionPKey`,
        sessionSigner.privateKey
      );

      // generate sessionModule
      const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
        smartAccountAddress: address,
      });

      // create session key data
      const sessionKeyData = defaultAbiCoder.encode(
        ["address", "address"],
        [
          sessionKeyEOA,
          chainConfigs[chainId].voteSessionValidationModuleContract,
        ]
      );

      const sessionTxData = await sessionModule.createSessionData([
        {
          validUntil: 0,
          validAfter: 0,
          sessionValidationModule:
            chainConfigs[chainId].voteSessionValidationModuleContract,
          sessionPublicKey: sessionKeyEOA,
          sessionKeyData: sessionKeyData,
        },
      ]);
      console.log("sessionTxData", sessionTxData);

      // tx to set session key
      const setSessiontrx = {
        to: DEFAULT_SESSION_KEY_MANAGER_MODULE, // session manager module address
        data: sessionTxData.data,
      };

      const transactionArray = [];

      if (enableSessionKeyModule) {
        // -----> enableModule session manager module
        const enableModuleTrx = await smartAccount.getEnableModuleData(
          DEFAULT_SESSION_KEY_MANAGER_MODULE
        );
        transactionArray.push(enableModuleTrx);
      }

      transactionArray.push(setSessiontrx);
      const hash = await createTransaction(transactionArray, smartAccount);

      console.log("txHash", hash);
      setIsSessionActive(true);
      toast({
        title: "Success! Session created succesfully",
        action: (
          <ToastAction
            altText="View Transaction"
            onClick={() =>
              window.open(
                `${chainConfigs[chainId].blockExplorerUrl}/tx/${hash}`
              )
            }
          >
            View Transaction
          </ToastAction>
        ),
      });
    } catch (err: any) {
      console.error(err);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      {!isSessionActive &&
        (isSessionKeyModuleEnabled ? (
          <Button
            onClick={async () => {
              setIsLoading(true);
              await createSession(false);
              setIsLoading(false);
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating session...
              </>
            ) : (
              <>Create Session</>
            )}
          </Button>
        ) : (
          <Button
            onClick={async () => {
              setIsLoading(true);
              await createSession(true);
              setIsLoading(false);
            }}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable and Create Session
          </Button>
        ))}
      {isSessionActive && (
        <>
          <Vote
            smartAccount={smartAccount}
            provider={provider}
            address={address}
          />
        </>
      )}
    </div>
  );
};

export default CreateSession;
