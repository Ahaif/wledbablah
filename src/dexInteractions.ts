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
            console.log(`Amount out for token B ${tokenB} in dex: ${ethers.formatUnits(amountsOut[1].toString())}`);
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
    slippageTolerance: number = 1 // Default slippage tolerance set to 1%
): Promise<ArbitrageOpportunityI> {
    try {
        console.log(`Amount out in Uniswap: ${ethers.formatEther(amountOutUniswap.toString())}, Amount out in Sushiswap: ${ethers.formatEther(amountOutSushiswap.toString())}`);
        
        const feeData = await provider.getFeeData();
        const adjustedGasPrice: bigint = BigInt(feeData.maxFeePerGas?.toString() || feeData.gasPrice?.toString() || '0') * BigInt(110) / BigInt(100);
        const estimatedGasLimit = BigInt(200000);
        const gasCost = adjustedGasPrice * estimatedGasLimit;

        console.log(`Gas cost: ${ethers.formatEther(gasCost.toString())}`);

        const slippageFactor = BigInt(Math.round(100 - (slippageTolerance * 100)));
        const effectiveAmountOutUniswap = (amountOutUniswap * slippageFactor) / BigInt(100);
        const effectiveAmountOutSushiswap = (amountOutSushiswap * slippageFactor) / BigInt(100);

        const rawProfitSushiswap = effectiveAmountOutSushiswap - effectiveAmountOutUniswap;
        const rawProfitUniswap = effectiveAmountOutUniswap - effectiveAmountOutSushiswap;

        const netProfitSushiswap : bigint = rawProfitSushiswap - gasCost;
        const netProfitUniswap : bigint = rawProfitUniswap - gasCost;

        console.log(`Potential profit in Sushiswap: ${ethers.formatEther(netProfitSushiswap.toString())}, Potential profit in Uniswap: ${ethers.formatEther(netProfitUniswap.toString())}`);

        if (netProfitSushiswap > 0n) {
            console.log(`Arbitrage opportunity detected: UNISWAP_TO_SUSHISWAP with profit: ${ethers.formatEther(netProfitSushiswap.toString())} ETH`);
            return {
                hasOpportunity: true,
                direction: 'UNISWAP_TO_SUSHISWAP',
                amountOut: netProfitSushiswap
            };
        } else if (netProfitUniswap > 0n) {
            console.log(`Arbitrage opportunity detected: SUSHISWAP_TO_UNISWAP with profit: ${ethers.formatEther(netProfitUniswap.toString())}`);
            return {
                hasOpportunity: true,
                direction: 'SUSHISWAP_TO_UNISWAP',
                amountOut: netProfitUniswap
            };
        } else {
            console.log(`No arbitrage opportunity detected. Sushiswap profit: ${ethers.formatEther(netProfitSushiswap.toString())}, Uniswap profit: ${ethers.formatEther(netProfitUniswap.toString())}`);
            return {
                hasOpportunity: false,
                direction: 'NONE',
                amountOut: 0n
            };
        }
    } catch (error) {
        console.error("Error in calculating arbitrage profit", error);
        return {
            hasOpportunity: false,
            direction: 'NONE',
            amountOut: 0n
        };
    }
}

