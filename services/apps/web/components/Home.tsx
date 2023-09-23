"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { BiconomySmartAccountV2 } from "@biconomy/account";
import { ethers } from "ethers";
import CreateSession from "../components/CreateSession";
import { createAccount } from "../utils/biconomy";
import { chainId } from "../utils/env";

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );

  useEffect(() => {
    connect();
  }, []);

  const connect = async () => {
    // @ts-ignore
    const { ethereum } = window;
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(ethereum);
      //   TODO switch chain
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
        <h1>Session Voting Demo</h1>
        {!loading && !address && (
          <button onClick={connect}>Connect to Web3</button>
        )}
        {loading && <p>Loading Smart Account...</p>}
        {address && <h2>Smart Account: {address}</h2>}
        {smartAccount && provider && (
          <CreateSession
            smartAccount={smartAccount}
            address={address}
            provider={provider}
          />
        )}
      </main>
    </>
  );
}
