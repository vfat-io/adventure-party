require("dotenv").config();

import { HardhatUserConfig } from "hardhat/config";

import "hardhat-typechain"
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.ftm.tools/"
      }
    },
    fantom: {
      url: "https://rpc.ftm.tools/",
      accounts: [process.env.PRIVATE_KEY!]
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;