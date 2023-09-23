import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { chainId, privateKey, thirdwebSecretKey } from "./env";

export const sdk = ThirdwebSDK.fromPrivateKey(privateKey, chainId, {
  clientId: "79207ebfd48efae3c4881a096dc59538",
  secretKey: thirdwebSecretKey,
});
