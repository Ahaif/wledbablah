import dotenv from 'dotenv';
import { ethers } from "ethers";
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import { DEX_IDENTIFIERS } from './constants';


dotenv.config();

// Setup the provider
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

// Uniswap Router address (make sure it's checksummed)
// console.log(DEX_IDENTIFIERS.UNISWAP);

// const uniswapRouterAddress = ethers.utils.getAddress('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
// console.log(uniswapRouterAddress);

// Initialize the Uniswap Router Contract
const uniswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.UNISWAP, UniswapRouterABI.result, provider);

export async function fetchLiquidity(tokenA:string,tokenB: string) {
  try {
    // Ensure both token addresses are checksummed
    const tokenAAddress = ethers.utils.getAddress(tokenA);
    const tokenBAddress = ethers.utils.getAddress(tokenB);

    // Use the getAmountsOut function
    const amountIn = ethers.utils.parseEther("1"); // Example: 1 token
    const amountsOut = await uniswapRouterContract.getAmountsOut(amountIn, [tokenAAddress, tokenBAddress]);

    // Output the amounts for debugging
    console.log(`Amounts Out: ${amountsOut}`);

    // Logic for comparing prices for arbitrage goes here
    // ...
  } catch (error) {
    console.error(`Error fetching liquidity: ${error}`);
  }
}

// Example usage (ensure you replace these with actual token addresses)
