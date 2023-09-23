import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { Bundler } from "@biconomy/bundler";
import { ethers } from "ethers";
import { BiconomyPaymaster, PaymasterMode } from "@biconomy/paymaster";
import { chainConfigs, chainId, privateKey, provider } from "./env";
import {
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
  ECDSAOwnershipValidationModule,
} from "@biconomy/modules";
// import { ECDSAOwnershipValidationModule } from "@biconomy/modules";

const bundler = new Bundler({
  bundlerUrl: `https://bundler.biconomy.io/api/v2/${chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`,
  chainId,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

const paymaster = new BiconomyPaymaster({
  paymasterUrl: chainConfigs[chainId].paymasterUrl,
});
// eslint-disable-next-line turbo/no-undeclared-env-vars
const wallet = new ethers.Wallet(privateKey, provider);

console.log("wallet address", wallet.address);

export async function createAccount() {
  console.log("chain id is", chainId);
  const module = await ECDSAOwnershipValidationModule.create({
    signer: wallet,
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
  });
  const biconomyAccount = await BiconomySmartAccountV2.create({
    chainId,
    bundler,
    paymaster,
    rpcUrl: chainConfigs[chainId].rpcUrl,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: module,
    // activeValidationModule: module,
  });

  console.log(
    "smart account address",
    await biconomyAccount.getAccountAddress()
  );

  return biconomyAccount;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTransaction(transactions: any[]) {
  const smartAccount = await createAccount();

  const userOp = await smartAccount.buildUserOp(transactions);
  console.debug("user op", userOp);

  try {
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
    console.debug("paymaster and data response", paymasterAndDataResponse);
    userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
    const userOpResponse = await smartAccount.sendUserOp(userOp);

    console.debug("waiting for user op tx", userOpResponse);

    const transactionDetail = await userOpResponse.wait();

    console.log("transaction detail below", transactionDetail.receipt);
    console.log(
      `${chainConfigs[chainId].blockExplorerUrl}/tx/${transactionDetail.receipt.transactionHash}`
    );
    return transactionDetail.receipt;
  } catch (e) {
    console.log("error", e);
  }
}
