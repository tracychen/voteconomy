import { ChainId } from "@biconomy/core-types";
import { Vote__factory } from "@voteconomy/contracts";
import { ethers } from "ethers";

// TODO setup user authentication
export const privateKey = process.env.PRIVATE_KEY || "";

export const chainId = Number(process.env.CHAIN_ID) as ChainId;

// Map of chains to their config
export const chainConfigs = {
  [ChainId.BASE_GOERLI_TESTNET]: {
    voteContract: "0x5b35a1b1a8F638aC979E2E247dAc77Bf2635de79",
    rpcUrl: "https://goerli.base.org",
    paymasterUrl: process.env.BASE_GOERLI_PAYMASTER_URL || "",
    blockExplorerUrl: "https://goerli.basescan.org",
    voteSessionValidationModuleContract:
      "0x816da14cb0b426e085b380e1a01dacb3669ab47e",
  },
  [ChainId.ARBITRUM_GOERLI_TESTNET]: {
    voteContract: "0x764A93978e1f0028e66cFE4DDDE097308dE2ED16",
    rpcUrl: "https://goerli-rollup.arbitrum.io/rpc",
    paymasterUrl: process.env.ARBITRUM_GOERLI_PAYMASTER_URL || "",
    blockExplorerUrl: "https://testnet.arbiscan.io",
    voteSessionValidationModuleContract:
      "0xe8b442ae8c9cc7a3ae5992da52d20767dfe8d825",
  },
  [ChainId.POLYGON_MUMBAI]: {
    voteContract: "0x764A93978e1f0028e66cFE4DDDE097308dE2ED16",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    paymasterUrl: process.env.POLYGON_MUMBAI_PAYMASTER_URL || "",
    blockExplorerUrl: "https://mumbai.polygonscan.com",
    voteSessionValidationModuleContract:
      "0xe8b442ae8c9cc7a3ae5992da52d20767dfe8d825",
  },
  [ChainId.LINEA_TESTNET]: {
    voteContract: "0x764A93978e1f0028e66cFE4DDDE097308dE2ED16",
    rpcUrl: "https://linea-testnet.rpc.thirdweb.com",
    paymasterUrl: process.env.LINEA_TESTNET_PAYMASTER_URL || "",
    blockExplorerUrl: "https://goerli.lineascan.build",
    voteSessionValidationModuleContract:
      "0xe8b442ae8c9cc7a3ae5992da52d20767dfe8d825",
  },
};
export const thirdwebSecretKey = process.env.THIRDWEB_SECRET_KEY || "";

export const provider = new ethers.providers.JsonRpcProvider(
  chainConfigs[chainId].rpcUrl
);

export const voteContract = Vote__factory.connect(
  chainConfigs[chainId].voteContract,
  provider
);
