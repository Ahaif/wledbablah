import dotenv from 'dotenv';
import { BigNumberish, } from "ethers";
import {ethers, JsonRpcApiProvider } from 'ethers';
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import SushiswapRouterAbi from './contracts/ABIs/SushiswapAbi.json';
import { DEX_IDENTIFIERS } from './constants';
import{ArbitrageOpportunityI} from './interfaces';
import { formatEther, parseEther} from 'ethers/lib.commonjs/utils';


dotenv.config();

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey || !provider) {
  throw new Error("PRIVATE_KEY or provider environment variable is not set.");
}
// const wallet = new ethers.Wallet(privateKey, provider); 
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

export async function fetchLiquidity(tokenA: string, tokenB: string, amount: BigInt, dexContract: ethers.Contract): Promise<bigint | null> {
    try {
        const tokenAAddress = ethers.getAddress(tokenA);
        const tokenBAddress = ethers.getAddress(tokenB);
        // Check if the contract has the getAmountsOut function properly.
        if (!dexContract.getAmountsOut) {
            console.error("getAmountsOut function is not available on the provided contract.");
            return null; // Indicates the function or contract is not properly set.
        }

        const amountsOut = await dexContract.getAmountsOut(amount, [tokenAAddress, tokenBAddress]);
        if (amountsOut && amountsOut[1] && BigInt(amountsOut[1].toString()) > 0) {
            return BigInt(amountsOut[1].toString()); // Convert the output to a bigint
        } else {
            console.error(`No liquidity available for token pair: ${tokenA} - ${tokenB}`);
            return null; // No liquidity found
        }
    } catch (error) {
        console.error(`Error fetching liquidity from dex: ${error}`);
        return null; // Return null on failure
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
export async function calculateArbitrageProfit(
    amountOutUniswap: bigint,
    amountOutSushiswap: bigint,
    slippageTolerance: number = 5 // Slippage tolerance set to 5%
): Promise<ArbitrageOpportunityI> {
    try {
        console.log("-------------------------------");
        console.log("Calculating arbitrage profit...");
        const feeData = await provider.getFeeData();
        const adjustedGasPrice = BigInt(feeData.maxFeePerGas?.toString() || feeData.gasPrice?.toString() || '0') * BigInt(110) / BigInt(100);
        const estimatedGasLimit = BigInt(200000); // Estimating gas for one swap
        const totalGasCost = adjustedGasPrice * estimatedGasLimit * BigInt(2); // Double the gas cost for two swaps
 

        // Adjust for slippage tolerance on both swaps
        const slippageFactor = BigInt(100 - slippageTolerance);
        const effectiveAmountOutUniswap = amountOutUniswap * slippageFactor / BigInt(100);
        const effectiveAmountOutSushiswap = amountOutSushiswap * slippageFactor / BigInt(100);


        // Calculate net profits accounting for both swaps
        const grossProfitUniswap = effectiveAmountOutUniswap - effectiveAmountOutSushiswap;
        const grossProfitSushiswap = effectiveAmountOutSushiswap - effectiveAmountOutUniswap;
        const netProfitUniswap = grossProfitUniswap - totalGasCost;
        const netProfitSushiswap = grossProfitSushiswap - totalGasCost;

        console.log(`Gas cost (total for two swaps): ${ethers.formatEther(totalGasCost.toString())}`);
        console.log(`Net Profit Uniswap: ${ethers.formatEther(netProfitUniswap.toString())}, Sushiswap: ${ethers.formatEther(netProfitSushiswap.toString())}`);
        console.log("-------------------------------");

        if (netProfitUniswap > 0n) {
            return {
                hasOpportunity: true,
                direction: 'UNISWAP_TO_SUSHISWAP',
                amountOutMin: effectiveAmountOutUniswap,
            };
        } else if (netProfitSushiswap > 0n) {
            return {
                hasOpportunity: true,
                direction: 'SUSHISWAP_TO_UNISWAP',
                amountOutMin: effectiveAmountOutSushiswap,
            };
        } else {
            console.log("No arbitrage opportunity found.");
            return {
                hasOpportunity: false,
                direction: 'NONE',
                amountOutMin: 0n,
            };
        }
    } catch (error) {
        console.error("Error in calculating arbitrage profit", error);
        return {
            hasOpportunity: false,
            direction: 'NONE',
            amountOutMin: 0n,
        };
    }
}
