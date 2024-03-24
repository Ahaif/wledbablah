


import { provider } from "./constants";
import dotenv from 'dotenv';


import UniswapRouterAbi from '../contracts/ABIs/UniswapRouter.json'
import pairABI from '../contracts/ABIs/eth-dai.json'


const ethers = require('ethers');

dotenv.config();

const uniswapRouterAddress = "0x7a250d5630B4cF539739df2C5dAcb4c659F2488D";


// Initialize the router contract instance
const router = new ethers.Contract(uniswapRouterAddress, UniswapRouterAbi, provider);

// Function to get reserves for a pair
async function getReserves(tokenA: string, tokenB: string): Promise<ethers.BigNumber[]> {
    const pairAddress = await router.getPair(tokenA, tokenB);
    const pairContract = new ethers.Contract(pairAddress, pairABI, provider);
    const reserves = await pairContract.getReserves();
    console.log("Reserves:", reserves);
    return [reserves._reserve0, reserves._reserve1];
}

// Simplified slippage calculation
function calculateSlippage(amountIn: ethers.BigNumber, reserveIn: ethers.BigNumber, reserveOut: ethers.BigNumber): ethers.BigNumber {
    return amountIn.mul(reserveOut).div(reserveIn.add(amountIn));
}

// Function to evaluate a trading opportunity
async function evaluateTrade(tokenA: string, tokenB: string, amountIn: ethers.BigNumber): Promise<void> {
    const [reserve0, reserve1] = await getReserves(tokenA, tokenB);
    const amountOutWithoutSlippage = calculateSlippage(amountIn, reserve0, reserve1);
    console.log("Estimated amount out without slippage:", amountOutWithoutSlippage.toString());
}

export { getReserves, calculateSlippage, evaluateTrade };
