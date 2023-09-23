import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { Bundler } from "@biconomy/bundler";
import { ethers } from "ethers";
import { BiconomyPaymaster, PaymasterMode } from "@biconomy/paymaster";
import { chainConfigs, chainId, privateKey, provider } from "./env";
import {
  BaseValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
  DEFAULT_SESSION_KEY_MANAGER_MODULE,
  ECDSAOwnershipValidationModule,
  SessionKeyManagerModule,
} from "@biconomy/modules";
import { defaultAbiCoder } from "ethers/lib/utils";

const bundler = new Bundler({
  bundlerUrl: `https://bundler.biconomy.io/api/v2/${chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`,
  chainId,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

export const paymaster = new BiconomyPaymaster({
  paymasterUrl: chainConfigs[chainId].paymasterUrl,
});

export async function createAccount(
  signer: ethers.Signer,
  validationModule?: BaseValidationModule
) {
  console.debug("chain id is", chainId);
  const vModule =
    validationModule ||
    (await ECDSAOwnershipValidationModule.create({
      signer,
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
    }));

  const biconomyAccount = await BiconomySmartAccountV2.create({
    chainId,
    bundler,
    paymaster,
    rpcUrl: chainConfigs[chainId].rpcUrl,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: vModule,
    activeValidationModule: vModule,
  });

  console.debug(
    "smart account address",
    await biconomyAccount.getAccountAddress()
  );

  return biconomyAccount;
}

export async function createSessionKey(signer: ethers.Signer) {
  const sessionSigner = ethers.Wallet.createRandom();
  const sessionKeyEOA = await sessionSigner.getAddress();
  console.log("sessionKeyEOA", sessionKeyEOA);
  console.log("sessionPKey", sessionSigner.privateKey);
  const smartAccount = await createAccount(signer);
  const sessionModule = await SessionKeyManagerModule.create({
    moduleAddress: DEFAULT_SESSION_KEY_MANAGER_MODULE,
    smartAccountAddress: await smartAccount.getAccountAddress(),
  });
  // create session key data
  const sessionKeyData = defaultAbiCoder.encode(
    ["address", "address"],
    [
      sessionKeyEOA,
      chainConfigs[chainId].voteContract, // vote contract address
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

  // -----> enableModule session manager module
  const enableModuleTrx = await smartAccount.getEnableModuleData(
    DEFAULT_SESSION_KEY_MANAGER_MODULE
  );

  return await createTransaction([enableModuleTrx, setSessiontrx]);
}

export async function createTransaction(
  transactions: any[],
  smartAccountOptional?: BiconomySmartAccountV2
) {
  let smartAccount = smartAccountOptional;
  if (!smartAccount) {
    const signer = new ethers.Wallet(privateKey, provider);
    console.log("getting smart accound for signer address", signer.address);
    smartAccount = await createAccount(signer);
  }

  const userOp = await smartAccount.buildUserOp(transactions);
  console.log("user op", userOp);

  const paymasterAndDataResponse = await paymaster.getPaymasterAndData(userOp, {
    mode: PaymasterMode.SPONSORED,
    smartAccountInfo: {
      name: "BICONOMY",
      version: "2.0.0",
    },
  });
  console.log("paymaster and data response", paymasterAndDataResponse);
  userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
  const userOpResponse = await smartAccount.sendUserOp(userOp);

  console.log("waiting for user op tx", userOpResponse);

  const transactionDetail = await userOpResponse.wait();

  console.log("transaction detail below", transactionDetail.receipt);
  console.log(
    `${chainConfigs[chainId].blockExplorerUrl}/tx/${transactionDetail.receipt.transactionHash}`
  );
  return transactionDetail.receipt;
}
