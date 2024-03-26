import dotenv from 'dotenv';
import { ethers } from "ethers";
import { evaluateTrade } from './watcher';
import { setupBlocknative } from './monitorMempool';

dotenv.config();



export const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);



async function main() {

    setupBlocknative();
    const tokenA = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
    const tokenB = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
    const amountIn = ethers.utils.parseEther("1"); // For 1 token, adjust as necessary

    // console.log("Current time (ISO format):", new Date().toISOString());
    // try{
    //     await evaluateTrade(tokenA, tokenB, amountIn);
    // }catch{
    //     console.log("Error in Evaluate Trade");
    // }
    
}

main().catch(console.error);


