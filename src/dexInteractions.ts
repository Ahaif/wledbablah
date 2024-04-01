import dotenv from 'dotenv';
import { BigNumber, ethers } from "ethers";
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import SushiswapRouterAbi from './contracts/ABIs/SushiswapAbi.json';
import { DEX_IDENTIFIERS } from './constants';


dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const uniswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.UNISWAP, UniswapRouterABI.result, provider);
const SushiswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.SUSHISWAP, SushiswapRouterAbi.result, provider);


// async function checkWalletBalanceForToken(walletAddress :string, tokenAddress: string, amountNeeded : BigNumber) {
//     const tokenContract = new ethers.Contract(tokenAddress, ["function balanceOf(address owner) view returns (uint256)"], provider);
//     const balance = await tokenContract.balanceOf(walletAddress);
//     return BigNumber.from(balance).gte(BigNumber.from(amountNeeded));
// }

// async function checkEthBalance(walletAddress, amountNeeded) {
//     const balance = await provider.getBalance(walletAddress);
//     return BigNumber.from(balance).gte(BigNumber.from(amountNeeded));
// }


export async function fetchLiquidity(tokenA:string,tokenB: string) {
  try {
    // Ensure both token addresses are checksummed
    const tokenAAddress = ethers.utils.getAddress(tokenA);
    const tokenBAddress = ethers.utils.getAddress(tokenB);


    // Use the getAmountsOut function
    const amountIn = ethers.utils.parseEther("10"); // Example: 1 token
    const amountsOut  = await uniswapRouterContract.getAmountsOut(amountIn, [tokenAAddress, tokenBAddress]);

    // Output the amounts for debugging
    console.log(`Liquidity for token ${tokenB}: ${ethers.utils.formatEther(amountsOut[1])}`);
    return amountsOut[1];
 

    // Logic for comparing prices for arbitrage goes here
    // ...
  } catch (error) {
    console.error(`Error fetching liquidity in uniswap: ${error}`);
  }
}


export async function fetch_LiquiditySushiswap(tokenA:string,tokenB: string) {
    try{

    const tokenAAddress = ethers.utils.getAddress(tokenA);
    const tokenBAddress = ethers.utils.getAddress(tokenB);


    // Use the getAmountsOut function
    const amountIn = ethers.utils.parseEther("10"); // Example: 1 token
    const amountsOut = await SushiswapRouterContract.getAmountsOut(amountIn, [tokenAAddress, tokenBAddress]);

    // Output the amounts for debugging
    console.log(`Liquidity for token in sushiswap ${tokenB}: ${ethers.utils.formatEther(amountsOut[1])}`);
    return amountsOut[1];
 

    // Logic for comparing prices for arbitrage goes here
    // ...
  } catch (error : any) {
    console.error(`Error fetching liquidity: ${error.message}`);
  }

}

export async function calculateArbitrageProfit(amountOutUniswap: BigNumber, amountOutSushiswap: BigNumber) {

    const amountOutUniswapBigNumber = ethers.BigNumber.from(amountOutUniswap.toString());
    const amountOutSushiswapBigNumber = ethers.BigNumber.from(amountOutSushiswap.toString());


    // Define slippage tolerance as 1%, for example
    try{   
        const slippageTolerance = 0.01; // 1%
        const estimatedGasFeeUniswap = ethers.utils.parseEther("0.01"); // Example: 0.01 ETH
        const estimatedGasFeeSushiswap = ethers.utils.parseEther("0.01"); // Example: 0.01 ETH


        const slippageFactorUniswap = amountOutUniswapBigNumber.mul(100 - (slippageTolerance * 100)).div(100);
        const slippageFactorSushiswap = amountOutSushiswapBigNumber.mul(100 - (slippageTolerance * 100)).div(100);
        
        const effectiveAmountOutUniswap = slippageFactorUniswap.sub(estimatedGasFeeUniswap);
        const effectiveAmountOutSushiswap = slippageFactorSushiswap.sub(estimatedGasFeeSushiswap);

        const potentialProfitSushiswap = effectiveAmountOutSushiswap.sub(effectiveAmountOutUniswap); // Sushiswap as target
        const potentialProfitUniswap = effectiveAmountOutUniswap.sub(effectiveAmountOutSushiswap ); // Uniswap as target

        console.log(`Potential Profit on Uniswap: ${ethers.utils.formatEther(potentialProfitUniswap)}`);
        console.log(`Potential Profit on Sushiswap: ${ethers.utils.formatEther(potentialProfitSushiswap)}`);

        

    // Determine the most profitable scenario
    if (potentialProfitSushiswap.gt(0) || potentialProfitUniswap.gt(0)) {
        if (potentialProfitSushiswap.gt(potentialProfitUniswap)) {
            console.log(`Profitable Arbitrage Opportunity on Sushiswap: ${ethers.utils.formatEther(potentialProfitSushiswap)}`);
        } else {
            console.log(`Profitable Arbitrage Opportunity on Uniswap: ${ethers.utils.formatEther(potentialProfitUniswap)}`);
        }
    } else {
        console.log("No profitable arbitrage opportunity found.");
    }}catch(e : any){
        console.log("Error in calculating arbitrage profit");
        console.log(e.message);
    }
}
