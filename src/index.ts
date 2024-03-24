import { ethers } from 'ethers';
import { evaluateTrade } from './watcher';
require('dotenv').config();

// Since your .env has the full URL, you don't need to construct it again
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_PROJECT_ID);

async function main() {
    const tokenA = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
    const tokenB = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
    const amountIn = ethers.utils.parseEther("1"); // For 1 token, adjust as necessary

    console.log("Current time (ISO format):", new Date().toISOString());
    console.log("Current time (Unix timestamp):", Date.now());

    await evaluateTrade(tokenA, tokenB, amountIn);
}

main().catch(console.error);
