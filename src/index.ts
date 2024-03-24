import { ethers } from "ethers";
import { evaluateTrade } from './watcher';
import dotenv from 'dotenv';

dotenv.config();



// import { JsonRpcProvider } from '@ethersproject/providers';

// Since your .env has the full URL, you don't need to construct it again
// console.log("INFURA_URL:", process.env.INFURA_URL);
export const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);



async function main() {

    const tokenA = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
    const tokenB = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
    const amountIn = ethers.utils.parseEther("1"); // For 1 token, adjust as necessary

    console.log("Current time (ISO format):", new Date().toISOString());
    
    await evaluateTrade(tokenA, tokenB, amountIn);
}

// async function main() {
//     const blockNumber = await provider.getBlockNumber();
//     console.log("Current block number:", blockNumber);
// }

main().catch(console.error);

// export { provider };
