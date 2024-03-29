import BlocknativeSdk,{ InitializationOptions  } from 'bnc-sdk';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { analyzeArbitrageOpportunity } from './analyzeArbitrageOpportunity';

dotenv.config();

const uniswapAddress = '0x7a250d5630B4cF539739df2C5dAcb4c659F2488D'; // Uniswap V2 Router Mainnet Address
const sushiSwapAddress = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'; // Replace with SushiSwap Router Address

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

    // Setup to monitor both Uniswap and SushiSwap addresses
    const uniswapEmitter = blocknative.account(uniswapAddress);
    const sushiSwapEmitter = blocknative.account(sushiSwapAddress);

    // Generalized function to handle transaction events
    const handleTransactionEvent = (transaction: any) => {
        try {
            analyzeArbitrageOpportunity(transaction);
        } catch (e) {
            console.error('Error analyzing potential arbitrage opportunity:', e);
        }
    };

    // Register callback for transaction events for Uniswap
    uniswapEmitter.emitter.on('txPool', handleTransactionEvent);

    // Register callback for transaction events for SushiSwap
    sushiSwapEmitter.emitter.on('txPool', handleTransactionEvent);

    console.log('Blocknative monitoring initiated for Uniswap and SushiSwap.');
}
