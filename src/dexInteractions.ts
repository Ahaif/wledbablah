import dotenv from 'dotenv';
import { ethers } from "ethers";
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import { DEX_IDENTIFIERS } from './constants';

dotenv.config();

export const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

export async function fetchLiquidity(tokenA: string, tokenB: string) {
    const routerContract = new ethers.Contract(DEX_IDENTIFIERS.UNISWAP, UniswapRouterABI.result, provider);
    const amountIn = ethers.utils.parseEther("1"); // Example amount for TokenA

    try {
        const amountsOut = await routerContract.getAmountsOut(amountIn, [tokenA, tokenB]);
        const amountOutTokenB = amountsOut[1];

        console.log(`For 1 unit of TokenA (${tokenA}), you get ${ethers.utils.formatUnits(amountOutTokenB, 18)} units of TokenB (${tokenB})`);

        // Here you would implement logic to fetch prices from another DEX (e.g., SushiSwap)
        // and compare them to identify arbitrage opportunities.
    } catch (error : any) {
        console.error('Error fetching liquidity:', error.message);
    }
}

// Example usage, replace token addresses with actual addresses
