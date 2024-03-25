import Mempool  from 'bnc-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Blocknative SDK with your API key
const blocknative = new Mempool({
    apiKey: process.env.BLOCKNATIVE_API_KEY,
    // dappId: process.env.BLOCKNATIVE_DAPP_ID, // Optional but recommended for analytics
    networkId: 1, // Mainnet. Change according to your target network.
    ws: WebSocket,
});

// Function to start monitoring the mempool for transactions to Uniswap contracts
export function startMonitoringUniswapTransactions(uniswapAddress: string): void {
  // Specify criteria for the transactions you're interested in
  // For example, transactions involving a specific Uniswap contract address
  blocknative.on('pendingTransaction', (transaction) => {
    // Check if the transaction is relevant (e.g., to or from Uniswap)
    if (transaction.to === uniswapAddress || transaction.from === uniswapAddress) {
      console.log(`Relevant transaction detected: ${transaction.hash}`);
      // Add further processing logic here
    }
  });

  console.log('Started monitoring mempool for transactions involving Uniswap');
}

// Example usage
// Replace 'YOUR_UNISWAP_CONTRACT_ADDRESS' with the actual contract address
// startMonitoringUniswapTransactions('YOUR_UNISWAP_CONTRACT_ADDRESS');
