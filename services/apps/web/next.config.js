module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  env: {
    BASE_GOERLI_PAYMASTER_URL: process.env.BASE_GOERLI_PAYMASTER_URL,
    POLYGON_MUMBAI_PAYMASTER_URL: process.env.POLYGON_MUMBAI_PAYMASTER_URL,
    ARBITRUM_GOERLI_PAYMASTER_URL: process.env.ARBITRUM_GOERLI_PAYMASTER_URL,
  },
};
