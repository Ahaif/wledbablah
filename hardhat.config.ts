import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import"@nomicfoundation/hardhat-ignition";

import * as dotenv from "dotenv";

dotenv.config();

// Utility function to ensure environment variables are defined
function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (typeof value === 'undefined') {
      throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
}

// Using the utility function to safely get environment variables
const MAINNET_FORK_URL = getEnvVariable('MAINNET_FORK_URL');
const PRIVATE_KEY = getEnvVariable('PRIVATE_KEY');

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    // ganache: {
    //   url: "http://127.0.0.1:7545",
    //   accounts: PRIVATE_KEY ? [`${PRIVATE_KEY}`] : [],
    // },
    // sepolia: {
    //   url: `https://sepolia.infura.io/v3/1b21b86ebb1c4aee8048fb612a51126e`,
    //   accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    // },
    hardhat: {
      forking: {
        url: MAINNET_FORK_URL, // Forking enabled using the provided mainnet URL
        // blockNumber: 19000000 , 
      },
    //   accounts: PRIVATE_KEY ? [
    //     {
    //       privateKey: PRIVATE_KEY, // Ensure PRIVATE_KEY is prefixed with 0x
    //       balance: "1000000000000000000000" // This is an example balance
    //     }
    //   ] : [],
    },

  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

export default config;
