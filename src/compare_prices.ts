import { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import UniswapRouter from './contracts/ABIs/UniswapRouter.json'
import SushiswapAbi from './contracts/ABIs/SushiswapAbi.json'

import { DEX_IDENTIFIERS } from './analyzeArbitrageOpportunity';

export async function compare_prices(tokenA: string, tokenB: string, amountIn: BigNumber, originatingDexAddress: string) {
    // Iterate through DEX_IDENTIFIERS to compare prices, excluding the originating DEX
    try{
        for (const [dexName, dexAddress] of Object.entries(DEX_IDENTIFIERS)) {
            // if (dexAddress.toLowerCase() === originatingDexAddress) continue; // Skip the originating DEX
            if(dexAddress.toLowerCase() === DEX_IDENTIFIERS.SUSHISWAP.toLowerCase()) {
                console.log("---------------------------")
                console.log("Skipping Sushiswap for now");
                continue;
            }// Skip Sushiswap (for now
    
            const price = await getPriceFromDex(dexAddress, tokenA, tokenB, amountIn);
            console.log(`${dexName} price for ${amountIn.toString()} of ${tokenA}: ${price.toString()}`);
        }
    }catch(e : any){
        console.log(e.message);
        console.log("Error in compare_prices");
    }
   
    // Add logic here to determine the best arbitrage opportunity based on the fetched prices
}

async function getPriceFromDex(dexAddress: string, tokenA: string, tokenB: string, amountIn: BigNumber): Promise<BigNumber> {
    const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
    const router = new ethers.Contract(dexAddress, UniswapRouter.result , provider);

    try {
        // Call getAmountsOut with the amount of tokenA to get an estimate of tokenB returned
        const amountsOut = await router.getAmountsOut(amountIn, [tokenA, tokenB]);
        return amountsOut[1]; // The amount of tokenB that you would get for your tokenA
    } catch (error) {
        console.error('Error fetching price from Uniswap V2:', error);
        return BigNumber.from("0");
    }
}