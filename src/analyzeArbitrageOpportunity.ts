import { ethers } from 'ethers';
import dotenv from 'dotenv';
import {compare_prices}  from './compare_prices';
dotenv.config();

// Constants and DEX Identifiers
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const DEX_IDENTIFIERS = {
    UNISWAP: '0x7a250d5630B4cF539739df2C5dAcb4c659F2488D',
    SUSHISWAP: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', // Replace with actual SushiSwap router address
};





function parseTransactionDetails(transaction: any) {
    let tokenA, tokenB;
    let amountInBN = ethers.BigNumber.from("0");

    if (transaction.contractCall.methodName === 'swapExactETHForTokens') {
        tokenA = WETH_ADDRESS;
        tokenB = transaction.contractCall.params.path[transaction.contractCall.params.path.length - 1];
        amountInBN = ethers.BigNumber.from(transaction.value);
    } else {
        tokenA = transaction.contractCall.params.path[0];
        tokenB = transaction.contractCall.params.path[transaction.contractCall.params.path.length - 1];
        amountInBN = ethers.BigNumber.from(transaction.contractCall.params.amountIn);
    }
    const formattedTokenA  = ethers.utils.getAddress(tokenA);
    const formattedTokenB = ethers.utils.getAddress(tokenB);

    return { formattedTokenA, formattedTokenB, amountInBN };
}

export async function analyzeArbitrageOpportunity(transaction: any) {
    const dexAddress = ethers.utils.getAddress(transaction.to);
    if (!transaction || !transaction.contractCall) {
        console.log("Transaction is empty, does not involve a contract call, or is not related to the monitored DEXes.");
        return;
    }

    const targetMethodNames = ['swapExactTokensForETHSupportingFeeOnTransferTokens', 'swapExactTokensForTokens', 'swapExactETHForTokens'];
    if (!targetMethodNames.includes(transaction.contractCall.methodName)) {
        console.log(`Transaction method ${transaction.contractCall.methodName} is not targeted for analysis.`);
        return;
    }

    // Extract token details and amount involved in the transaction
    const { formattedTokenA, formattedTokenB, amountInBN } = parseTransactionDetails(transaction);

    console.log(`Analyzing potential trade from DEX at ${dexAddress}.
     Method: ${transaction.contractCall.methodName}, 
     TokenA: ${formattedTokenA}, 
     TokenB: ${formattedTokenB},
     AmountIn: ${amountInBN.toString()}`);

    // Call function to compare prices across DEXes, excluding the originating DEX
    await compare_prices(formattedTokenA, formattedTokenB, amountInBN, dexAddress).catch(console.error);
}

