# 🗳️ Voteconomy

Balancing UX and on-chain integrity in DAO voting and governance.

## About

### Problem

The problem we are trying to solve is around the challenge of achieving a balance between providing a good user experience (UX) with low friction while ensuring on-chain persistence and integrity in decentralized autonomous organizations (DAOs).

- **Good UX, Low Friction:** This aspect emphasizes the importance of making the process of voting in a DAO as easy and user-friendly as possible. Ideally, users should be able to participate in voting without facing complex transaction signing and submission processes, which can deter participation.
- **On-Chain Persistence/Integrity:** On the other hand, DAOs require transparency and immutability of data, especially when it comes to voting outcomes. The votes cast by participants need to be recorded on the blockchain to ensure that the results are tamper-proof and can be independently verified.

### Solution

By combining account abstraction with session keys, we eliminate the need for users to hold native tokens for gas fees and eliminate wallet signing for each write operation on-chain, both which can often be friction points in decentralized applications.

![Voteconomy](docs/images/voteconomy.png)

#### Paymasters

Biconomy's account abstraction stack includes managed bundlers and paymasters, enables us to sponsor gas costs on behalf of users, thus promoting a seamless and user-friendly environment.

![Paymaster Flow](docs/images/paymaster.png)

#### Session Keys

Biconomy's Session Key Manager Module performs general checks: is Session Key enabled and not expired? If everything is valid, it forwards the Session Validation flow to our customSession Validation modules

![Session Key Diagram](docs/images/sk.png)

## Deployed Contracts

By deploying contracts on multiple networks, we enable various DAOs to leverage our voting and session validation contracts on their respective networks, fostering wider adoption and flexibility.

Note that some do not have session validation module as Biconomy's session key management contract module does not yet support these chains!

| Network                 | Simple Vote Contract                       | Session Validation Module                  |
| ----------------------- | ------------------------------------------ | ------------------------------------------ |
| Base Goerli Testnet     | 0x5b35a1b1a8F638aC979E2E247dAc77Bf2635de79 | 0x816da14cb0b426e085b380e1a01dacb3669ab47e |
| Arbitrum Goerli Testnet | 0x764A93978e1f0028e66cFE4DDDE097308dE2ED16 | 0xe8b442ae8c9cc7a3ae5992da52d20767dfe8d825 |
| Polygon Mumbai Testnet  | 0x764A93978e1f0028e66cFE4DDDE097308dE2ED16 | 0xe8b442ae8c9cc7a3ae5992da52d20767dfe8d825 |
| Linea Testnet           | 0x764A93978e1f0028e66cFE4DDDE097308dE2ED16 | 0xe8b442ae8c9cc7a3ae5992da52d20767dfe8d825 |
| Scroll Sepolia Testnet  | 0x0660b6c585eab822C9B4c8fbeFCC276DF17831EB |                                            |
| Gnosis Testnet          | 0x831320aE215baD3A01A16C9CD5001A5c3988aED1 |                                            |
| Mantle Testnet          | 0x831320aE215baD3A01A16C9CD5001A5c3988aED1 |                                            |
