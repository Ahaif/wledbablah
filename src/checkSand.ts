import dotenv from 'dotenv';
import { ethers } from 'ethers';
import BlocknativeSdk, { InitializationOptions, TransactionEvent, SDKError } from 'bnc-sdk';
import WebSocket from 'ws'
import { evaluateTrade } from './watcher';

dotenv.config();

// Assumed constants - replace with actual values or dynamic lookups as needed
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH address for ETH trades

export async function analyzePotentialSandwich(transaction : any) {
    if (!transaction || !transaction.contractCall) {
        console.log("Transaction is empty or does not involve a contract call.");
        return;
    }

    const targetMethodNames = ['swapExactTokensForETHSupportingFeeOnTransferTokens', 'swapExactTokensForTokens', 'swapExactETHForTokens'];
    if (!targetMethodNames.includes(transaction.contractCall.methodName)) {
        console.log(`Transaction method ${transaction.contractCall.methodName} is not targeted for analysis.`);
        return; 
    }

    let tokenA, tokenB;
    let amountInBN = ethers.BigNumber.from("0");

    // Determine tokens involved and amountIn
    if (transaction.contractCall.methodName === 'swapExactETHForTokens') {
        tokenA = WETH_ADDRESS; // Use WETH as tokenA for ETH swaps
        tokenB = transaction.contractCall.params.path[transaction.contractCall.params.path.length - 1];
        amountInBN = ethers.BigNumber.from(transaction.value); // ETH amount is in the value field for these swaps
    } else {
        // For token to token swaps, extract from path
        tokenA = transaction.contractCall.params.path[0];
        tokenB = transaction.contractCall.params.path[transaction.contractCall.params.path.length - 1];
        amountInBN = ethers.BigNumber.from(transaction.contractCall.params.amountIn);
    }

    console.log(`Analyzing potential trade. Method: ${transaction.contractCall.methodName}, TokenA: ${tokenA}, TokenB: ${tokenB}, AmountIn: ${amountInBN.toString()}`);
    
    // Now, call evaluateTrade with the extracted values
    await evaluateTrade(tokenA, tokenB, amountInBN).catch(console.error);
}