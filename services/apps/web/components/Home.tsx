"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { BiconomySmartAccountV2 } from "@biconomy/account";
import { ethers } from "ethers";
import CreateSession from "../components/CreateSession";
import { createAccount } from "../utils/biconomy";
import { chainConfigs, chainId } from "../utils/env";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.JsonRpcProvider | null>(null);

  useEffect(() => {
    connect();
  }, []);

  const connect = async () => {
    // @ts-ignore
    const { ethereum } = window;
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(ethereum);
      //   TODO trigger reset on wallet switch
      await provider.send("eth_requestAccounts", []);
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }], // chainId must be in hexadecimal numbers
      });
      const signer = provider.getSigner();

      setProvider(provider);

      let biconomySmartAccount = await createAccount(signer);
      const address = await biconomySmartAccount.getAccountAddress();
      setSmartAccount(biconomySmartAccount);
      console.log({ address });
      setAddress(address);
      console.log({ smartAccount });
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };
  console.log({ smartAccount, provider });
  return (
    <>
      <Head>
        <title>Session Keys</title>
        <meta
          name="description"
          content="Build a dApp powered by session keys"
        />
      </Head>
      <main>
        <div className="p-8 flex flex-col gap-1">
          <div className="text-3xl">Governance Dashboard</div>
          <div className="text-muted-foreground">
            This is a demo of how account abstraction and session keys can be
            used to improve user experience when interacting with contracts for
            DAOs and governance.
          </div>
          {!loading && !address && (
            <Button onClick={connect}>Connect to Web3</Button>
          )}
          {loading && <Skeleton className="h-4 w-[250px]" />}
          {address && (
            <div>
              Smart Account:{" "}
              <Link
                href={`${chainConfigs[chainId].blockExplorerUrl}/address/${address}`}
                target="_blank"
                className="underline"
              >
                {address}
              </Link>
            </div>
          )}
          {smartAccount && provider && (
            <CreateSession
              smartAccount={smartAccount}
              address={address}
              provider={provider}
            />
          )}
        </div>
      </main>
    </>
  );
}
