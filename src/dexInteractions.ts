import dotenv from 'dotenv';
import { ethers } from "ethers";
// Assume UniswapV2RouterABI.json is the ABI file for the Uniswap V2 Router contract
import UniswapRouter from './contracts/ABIs/UniswapRouter.json';    
import { DEX_IDENTIFIERS } from './analyzeArbitrageOpportunity';

dotenv.config();




export const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

export async function fetchLiquidity(tokenA: string, tokenB: string) {
    const routerContract = new ethers.Contract(DEX_IDENTIFIERS.UNISWAP, UniswapRouter.result, provider);
    // Instantiate the Uniswap V2 Router contract
    
  
   
}
