import ethers  from 'ethers';
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import SushiswapABI from './contracts/ABIs/SushiswapAbi.json';

import { DEX_IDENTIFIERS } from './constants';

export async function compare_prices(tokenA: string, tokenB: string, amountIn: BigInt, originatingDexAddress: string) {
    const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
    let prices = [];

    for (const [dexName, dexAddress] of Object.entries(DEX_IDENTIFIERS)) {
        if (dexAddress.toLowerCase() === originatingDexAddress.toLowerCase()) {
            console.log(`Skipping ${dexName} as it is the originating DEX.`);
            continue; // Skip the originating DEX
        }

        console.log("Dex Name: ", dexName);
        console.log("Dex Address: ", dexAddress);

        // Select the correct ABI based on the DEX name
        const selectedABI = dexName === 'UNISWAP' ? UniswapRouterABI.result : SushiswapABI.result;
        const price = await getPriceFromDex(dexAddress, tokenA, tokenB, amountIn, provider, selectedABI);
        
        if (!price.isZero()) { // Ensure there's a valid price
            prices.push({ dexName, price });
        }
    }

    // Now, you have all the prices collected, you can compare them to find the best opportunity
    if (prices.length > 0) {
        // Example: find the highest price offer for tokenB
        const bestPriceOpportunity = prices.reduce((prev, current) => (prev.price.gt(current.price) ? prev : current));

        console.log(`Best arbitrage opportunity at ${bestPriceOpportunity.dexName} with an amount out of ${bestPriceOpportunity.price.toString()} for token ${tokenB}`);
    } else {
        console.log("No arbitrage opportunities found.");
    }
}
async function getPriceFromDex(dexAddress: string, tokenA: string, tokenB: string, amountIn: BigInt, provider: ethers.providers.JsonRpcProvider, abi: any): Promise<BigInt> {
    const router = new ethers.Contract(dexAddress, abi, provider);

    try {
        const amountsOut = await router.getAmountsOut(amountIn, [tokenA, tokenB]);
        if (amountsOut[1] == 0) {
            throw new Error('No liquidity or not listed.');
        }
        return amountsOut[1];
    } catch (error: any) {
        console.error(`Error fetching price from ${dexAddress} for pair ${tokenA}-${tokenB}: NOliquidity or Not Listed`);
        return BigInt("0");
    }
}
