import Mempool  from 'bnc-sdk';
import { ethers } from 'ethers';
import BlocknativeSdk from 'bnc-sdk'
import SDK from 'bnc-sdk';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

// Initialize Blocknative SDK
const blocknative = new SDK({
  dappId: process.env.BLOCKNATIVE_DAPP_ID as string,
  networkId: 1,
  ws: WebSocket
});

// Monitor transactions
const startMonitoringMempool = () => {
  console.log("Monitoring mempool for Uniswap transactions...");

  // Replace 'YOUR_UNISWAP_CONTRACT_ADDRESS' with actual Uniswap contract address you are interested in
  const uniswapContractAddress = 'YOUR_UNISWAP_CONTRACT_ADDRESS';

  blocknative.on('pendingTransaction', (transaction: any) => {
    // Check if transaction is relevant
    if (transaction.to === uniswapContractAddress || transaction.from === uniswapContractAddress) {
      console.log(`Transaction ${transaction.hash} involving Uniswap detected in mempool.`);
    }
  });
}

startMonitoringMempool();

// Example usage
// Replace 'YOUR_UNISWAP_CONTRACT_ADDRESS' with the actual contract address
// startMonitoringUniswapTransactions('YOUR_UNISWAP_CONTRACT_ADDRESS');
