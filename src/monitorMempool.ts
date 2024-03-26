import dotenv from 'dotenv';
import BlocknativeSdk, { InitializationOptions, TransactionEvent, SDKError } from 'bnc-sdk';
import WebSocket from 'ws'

dotenv.config();


dotenv.config();

const uniswapAddress = '0x7a250d5630B4cF539739df2C5dAcb4c659F2488D'; // Uniswap V2 Router Mainnet Address


export function setupBlocknative() {
  const apiKey = process.env.BLOCKNATIVE_DAPP_ID;
  if (!apiKey) {
      throw new Error('Please set your Blocknative API key in the environment variable BLOCKNATIVE_DAPP_ID.');
  }

  const options: InitializationOptions = {
      dappId: apiKey,
      networkId: 1, // Ethereum mainnet
      system: 'ethereum',
      ws: WebSocket,
  };

  const blocknative = new BlocknativeSdk(options);

  // Watch the Uniswap address
  const { emitter } = blocknative.account(uniswapAddress);

  // Log initial account details for debugging/tracking
  

  // Register callback for transaction events, e.g., 'txPool'
  emitter.on('txPool', (transaction) => {
      console.log('Transaction in pool:', transaction);
  });

  // Register more callbacks as needed based on the events you're interested in
  emitter.on('txConfirmed', (transaction) => {
      console.log('Transaction confirmed:', transaction);
  });

  console.log('Blocknative monitoring initiated for:', uniswapAddress);
}