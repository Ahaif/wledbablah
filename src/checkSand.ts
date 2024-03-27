import dotenv from 'dotenv';
import BlocknativeSdk, { InitializationOptions, TransactionEvent, SDKError } from 'bnc-sdk';
import WebSocket from 'ws'

dotenv.config();


export function analyzePotentialSandwich(transaction: any) {
    if (!transaction) {
        console.log("Transaction is empty");
        return;
    }

    // Check if the transaction involves a contract call
    if (!transaction.contractCall) {
        console.log("Transaction does not involve a contract call.");
        return; // Gracefully skip non-relevant transactions
    }

    // List of swap method names you're interested in analyzing
    const targetMethodNames = [
        'swapExactTokensForETHSupportingFeeOnTransferTokens',
        'swapExactTokensForTokens',
        'swapExactETHForTokens',
        // Add more method names as necessary
    ];

    // Check if the transaction method name is one of the target methods
    if (!targetMethodNames.includes(transaction.contractCall.methodName)) {
        console.log(`Transaction method ${transaction.contractCall.methodName} is not targeted for analysis.`);
        return; // Gracefully skip transactions with non-targeted method names
    }

    // Determine amountIn based on the method
    let amountIn;
    if (transaction.contractCall.methodName === 'swapExactETHForTokens') {
        // For ETH swaps, 'amountIn' is the transaction value
        amountIn = transaction.value;
    } else {
        // For token swaps, 'amountIn' is specified in the method parameters
        amountIn = transaction.contractCall.params.amountIn;
    }

    const amountOutMin = transaction.contractCall.params.amountOutMin;

    console.log(`Transaction to Uniswap detected, method: ${transaction.contractCall.methodName}, amountIn: ${amountIn}, amountOutMin: ${amountOutMin}`);

    // Add further analysis logic here...
}