import { ChainId } from "@biconomy/core-types";
import { Vote__factory } from "@voteconomy/contracts";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

// TODO setup user authentication
export const privateKey = process.env.PRIVATE_KEY || "";

export const chainId = ChainId.POLYGON_MUMBAI;

// Map of chains to their config
export const chainConfigs = {
  [ChainId.BASE_GOERLI_TESTNET]: {
    vote: "0xdB87a06c382FC6F8A48b8f0b173DA458EaCA8b99",
    rpcUrl: "https://goerli.base.org",
    paymasterUrl: process.env.BASE_GOERLI_PAYMASTER_URL || "",
    blockExplorerUrl: "https://goerli.basescan.org",
  },
  [ChainId.ARBITRUM_GOERLI_TESTNET]: {
    vote: "0x764A93978e1f0028e66cFE4DDDE097308dE2ED16",
    rpcUrl: "https://goerli-rollup.arbitrum.io/rpc",
    paymasterUrl: process.env.ARBITRUM_GOERLI_PAYMASTER_URL || "",
    blockExplorerUrl: "https://testnet.arbiscan.io",
  },
  [ChainId.POLYGON_MUMBAI]: {
    vote: "0x764A93978e1f0028e66cFE4DDDE097308dE2ED16",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    paymasterUrl: process.env.POLYGON_MUMBAI_PAYMASTER_URL || "",
    blockExplorerUrl: "https://mumbai.polygonscan.com",
  },
};
export const thirdwebSecretKey = process.env.THIRDWEB_SECRET_KEY || "";

export const provider = new ethers.providers.JsonRpcProvider(
  chainConfigs[chainId].rpcUrl
);

export const voteContract = Vote__factory.connect(
  chainConfigs[chainId].vote,
  provider
);
