import dotenv from 'dotenv';
import { BigNumberish, } from "ethers";
import {ethers, JsonRpcApiProvider } from 'ethers';
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import SushiswapRouterAbi from './contracts/ABIs/SushiswapAbi.json';
import { DEX_IDENTIFIERS } from './constants';
import{ArbitrageOpportunityI} from './interfaces';
import { formatEther, parseEther} from 'ethers/lib.commonjs/utils';
import { on } from 'ws';


dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
// Assuming you're getting the private key like this:
const privateKey = process.env.PRIVATE_KEY;

// Validate privateKey is not undefined before using it to create the Wallet instance
if (!privateKey) {
  throw new Error("PRIVATE_KEY environment variable is not set.");
}

const wallet = new ethers.Wallet(privateKey, provider); 
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
    const tokenAAddress = ethers.getAddress(tokenA);
    const tokenBAddress = ethers.getAddress(tokenB);


    // Use the getAmountsOut function
    const amountIn = ethers.parseEther("10"); // Example: 1 token
    const amountsOut  = await uniswapRouterContract.getAmountsOut(amountIn, [tokenAAddress, tokenBAddress]);

    // Output the amounts for debugging
    console.log(`Liquidity for token ${tokenB}: ${ethers.formatEther(amountsOut[1])}`);
    return amountsOut[1];
 

    // Logic for comparing prices for arbitrage goes here
    // ...
  } catch (error) {
    console.error(`Error fetching liquidity in uniswap: ${error}`);
  }
}


export async function fetch_LiquiditySushiswap(tokenA:string,tokenB: string) {
    try{

    const tokenAAddress = ethers.getAddress(tokenA);
    const tokenBAddress = ethers.getAddress(tokenB);


    // Use the getAmountsOut function
    const amountIn = ethers.parseEther("10"); // Example: 1 token
    const amountsOut = await SushiswapRouterContract.getAmountsOut(amountIn, [tokenAAddress, tokenBAddress]);

    // Output the amounts for debugging
    console.log(`Liquidity for token in sushiswap ${tokenB}: ${ethers.formatEther(amountsOut[1])}`);
    return amountsOut[1];
 
  } catch (error : any) {
    console.error(`Error fetching liquidity: ${error.message}`);
  }

}


// async function getCurrentGasPrice(){
//   try {
//       const gasPrice = await provider.getGasPrice();
//       console.log(`Current gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
//       return gasPrice;
//   } catch (error) {
//       console.error('Error fetching current gas price:', error);
//       throw error;
//   }
// }


// export async function estimateGasLimitForTokenSwap(
//   dexRouterContract : ethers.Contract,
//   tokenInAddress: string,
//   tokenOutAddress: string,
//   tokenInAmount: BigNumber,
//   userAddress: string,
// ) {
//   try{
//     let now = new Date
// // Uniswap requires a deadline for the swap. 30 minutes from now expressed as milliseconds since epoch 
// const deadline = now.setTime(now.getTime() + (30 * 60 * 1000)) 
// const gasLimit = await dexRouterContract.estimateGas.swapExactTokensForTokens(
//   tokenInAmount,
//   0,
//   [
//       tokenInAddress,
//       tokenOutAddress
//   ],
//   userAddress,
//   deadline,
//   {
//       from: userAddress
//   }
// )
// return gasLimit.toString()

//   }catch(e : any){
//     throw new Error(`Error estimating gas limit for token swap: ${e.message}`);
//   }

// }






// Correcting for ethers v6 and native BigInt usage
export async function calculateArbitrageProfit(
    amountOutUniswap: bigint, // Using native bigint type
    amountOutSushiswap: bigint,
    tokenA: string,
    tokenB: string
): Promise<ArbitrageOpportunityI> {
    try {
        const slippageTolerance = 1n - 1n / 100n; // Adjusted for bigint, equivalent to 99/100 for 1% slippage

        const feeData = await provider.getFeeData();
        let adjustedGasPrice;
        
        if (feeData.gasPrice) {
            adjustedGasPrice = feeData.gasPrice * 110n / 100n;
        } else if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            // Simplistic adjustment, consider a more nuanced approach based on network conditions
            adjustedGasPrice = (feeData.maxFeePerGas + feeData.maxPriorityFeePerGas) / 2n;
            adjustedGasPrice = adjustedGasPrice * 110n / 100n;
        } else {
            throw new Error("Unable to determine the gas price.");
        }
        const estimatedGasLimit = 200000n; // Using bigint literal

        // Calculating gas costs
        const gasCostUniswap = estimatedGasLimit * adjustedGasPrice;
        const gasCostSushiswap = estimatedGasLimit * adjustedGasPrice;

        // Note: formatUnits expects a string for its first argument
        console.log(`Gas cost for Uniswap: ${ethers.formatUnits(gasCostUniswap.toString(), 'ether')} ETH`);
        console.log(`Gas cost for Sushiswap: ${ethers.formatUnits(gasCostSushiswap.toString(), 'ether')} ETH`);

        // Applying slippage tolerance and subtracting gas costs
        const effectiveAmountOutUniswap = amountOutUniswap * slippageTolerance / 100n - gasCostUniswap;
        const effectiveAmountOutSushiswap = amountOutSushiswap * slippageTolerance / 100n - gasCostSushiswap;

        // Calculating potential profit
        const potentialProfitSushiswap = effectiveAmountOutSushiswap - effectiveAmountOutUniswap;
        const potentialProfitUniswap = effectiveAmountOutUniswap - effectiveAmountOutSushiswap;

        console.log(`Potential Profit on Uniswap: ${ethers.formatUnits(potentialProfitUniswap.toString(), 'ether')} ETH`);
        console.log(`Potential Profit on Sushiswap: ${ethers.formatUnits(potentialProfitSushiswap.toString(), 'ether')} ETH`);

        if (potentialProfitSushiswap > 0 && potentialProfitSushiswap > potentialProfitUniswap) {
            return {
                hasOpportunity: true,
                direction: 'UNISWAP_TO_SUSHISWAP',
                amount: amountOutSushiswap // Note: Adjust according to your interface expectations
            };
        } else if (potentialProfitUniswap > 0) {
            return {
                hasOpportunity: true,
                direction: 'SUSHISWAP_TO_UNISWAP',
                amount: amountOutUniswap
            };
        } else {
            return {
                hasOpportunity: false,
                direction: 'NONE',
                amount: 0n
            };
        }
    } catch(e : any) {
        console.error("Error in calculating arbitrage profit", e.message);
        return {
            hasOpportunity: false,
            direction: 'NONE',
            amount: 0n
        };
    }
}


