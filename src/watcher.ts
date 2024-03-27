
import dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();




import PairAbi from './contracts/ABIs/eth-dai.json';
import UniswapFactoryAbi from './contracts/ABIs/UniswapFactory.json';



const uniswapRouterAddress = "0x7a250d5630B4cF539739df2C5dAcb4c659F2488D";
const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);







// Initialize the router and factory contract instances
// const router = new ethers.Contract(uniswapRouterAddress, UniswapRouterAbi.result, provider);
const factory = new ethers.Contract(uniswapFactoryAddress, UniswapFactoryAbi.result, provider);
if(!factory){
    console.log("Factory not found");
}

// Function to get the pair address
async function getPairAddress(tokenA: string, tokenB: string): Promise<string> {
    if(!provider){
    console.log("Provider not found")};
    return await factory.getPair(tokenA, tokenB);
}

// Function to get reserves for a pair
// async function getReserves(pairAddress: string): Promise<ethers.BigNumber[]> {
//     const pairContract = new ethers.Contract(pairAddress, PairAbi.result, provider);
//     const reserves = await pairContract.getReserves();
//     console.log("Reserves:", reserves._reserve0.toString(), reserves._reserve1.toString());
//     return [reserves._reserve0, reserves._reserve1];
// }

// Simplified slippage calculation
// function calculateSlippage(amountIn: ethers.BigNumber, reserveIn: ethers.BigNumber, reserveOut: ethers.BigNumber): ethers.BigNumber {
//     return amountIn.mul(reserveOut).div(reserveIn.add(amountIn));
// }

// Function to evaluate a trading opportunity
async function evaluateTrade(tokenA: string, tokenB: string, amountIn: ethers.BigNumber): Promise<void> {
    console.log("Token A:", tokenA);
    console.log("Token B:", tokenB);
    try{
        const pairAddress = await getPairAddress(tokenA, tokenB);
        if (pairAddress === ethers.constants.AddressZero) {
            console.log("Pair not found.");
            return;
    }
    console.log("Pair address:", pairAddress);
    
    // const [reserve0, reserve1] = await getReserves(pairAddress);
    // const reserve0Formatted = ethers.utils.formatUnits(reserve0, 18);
    // const reserve1Formatted = ethers.utils.formatUnits(reserve1, 18);
    
    // console.log("Formatted Reserve  Token A:", reserve0Formatted);
    // console.log("Formatted Reserve  Token B", reserve1Formatted);
    // Assuming tokenA corresponds to reserve0 and tokenB to reserve1 for simplicity, you might need to adjust based on actual token addresses
    // const amountOutWithoutSlippage = calculateSlippage(amountIn, reserve0, reserve1);
    // console.log("Estimated amount out without slippage:", amountOutWithoutSlippage.toString());
    // const amoutWithoutSlippafeFormated = ethers.utils.formatUnits(amountOutWithoutSlippage, 18);
    // console.log("Estimated amount out without slippage:", amoutWithoutSlippafeFormated);
    }catch(e){
        console.log("Error in pair Address:", e);
    }
    
    
  
    

}

export { getPairAddress, evaluateTrade };
