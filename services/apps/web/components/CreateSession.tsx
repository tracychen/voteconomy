"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  SessionKeyManagerModule,
  DEFAULT_SESSION_KEY_MANAGER_MODULE,
} from "@biconomy/modules";
import { BiconomySmartAccountV2 } from "@biconomy/account";
import { defaultAbiCoder } from "ethers/lib/utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { chainConfigs, chainId } from "../utils/env";
import { createTransaction, paymaster } from "../utils/biconomy";
import Vote from "./Vote";

interface props {
  smartAccount: BiconomySmartAccountV2;
  address: string;
  provider: ethers.providers.Provider;
}

const CreateSession: React.FC<props> = ({
  smartAccount,
  address,
  provider,
}) => {
  const [isSessionKeyModuleEnabled, setIsSessionKeyModuleEnabled] =
    useState<boolean>(false);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  //   useEffect(() => {
  //     // check if session active
  //     let checkSessionActive = async () => {
  //       const sessionKeyPrivKey = window.localStorage.getItem("sessionPKey");
  //       if (sessionKeyPrivKey) {
  //         setIsSessionActive(true);
  //       }
  //     };
  //     checkSessionActive();
  //   }, []);

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
    toast.info("Creating Session...", {
      position: "top-right",
      autoClose: 15000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
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
      // BREWARE JUST FOR DEMO: update local storage with session key
      window.localStorage.setItem("sessionPKey", sessionSigner.privateKey);

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
      toast.success(`Success! Session created succesfully`, {
        position: "top-right",
        autoClose: 18000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (err: any) {
      console.error(err);
    }
  };
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {!isSessionActive &&
        (isSessionKeyModuleEnabled ? (
          <button onClick={() => createSession(false)}>Create Session</button>
        ) : (
          <button onClick={() => createSession(true)}>
            Enable and Create Session
          </button>
        ))}
      {isSessionActive && (
        <Vote
          smartAccount={smartAccount}
          provider={provider}
          address={address}
        />
      )}
    </div>
  );
};

export default CreateSession;
