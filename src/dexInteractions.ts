import dotenv from 'dotenv';
import { BigNumberish, } from "ethers";
import {ethers, JsonRpcApiProvider } from 'ethers';
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import SushiswapRouterAbi from './contracts/ABIs/SushiswapAbi.json';
import { DEX_IDENTIFIERS } from './constants';
import{ArbitrageOpportunityI} from './interfaces';
import { formatEther, parseEther} from 'ethers/lib.commonjs/utils';
import { on } from 'ws';
import { provider } from '.';


dotenv.config();

// const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);

// Assuming you're getting the private key like this:
const privateKey = process.env.PRIVATE_KEY;

// Validate privateKey is not undefined before using it to create the Wallet instance
if (!privateKey || !provider) {
  throw new Error("PRIVATE_KEY or provider environment variable is not set.");
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
    const amountIn: BigInt = ethers.parseEther("10"); // Example: 1 token
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




export async function calculateArbitrageProfit(
    amountOutUniswap: bigint,
    amountOutSushiswap: bigint,
    tokenA: string,
    tokenB: string
): Promise<ArbitrageOpportunityI> {
    try {
        // Adjusted for bigint, assuming a percentage (e.g., 1% as 0.99)
        const slippageTolerance: bigint = 99n;

        // Fetching the gas price as bigint
        const feeData = await provider.getFeeData();
        let adjustedGasPrice: bigint;

        // Check and use maxFeePerGas if EIP-1559 is supported, otherwise use gasPrice
        if (feeData.maxFeePerGas) {
            adjustedGasPrice = (feeData.maxFeePerGas * 110n) / 100n; // Adjusting the gas price by 10%
        } else if (feeData.gasPrice) {
            adjustedGasPrice = (feeData.gasPrice * 110n) / 100n; // Adjusting the gas price by 10%
        } else {
            throw new Error("Unable to determine the gas price.");
        }

        const estimatedGasLimit = 200000n; // Using bigint literal for gas limit

        // Calculating gas costs as bigint
        const gasCost = estimatedGasLimit * adjustedGasPrice;

        // Applying slippage tolerance and subtracting gas costs, ensuring all operations are with bigint
        const effectiveAmountOutUniswap = (amountOutUniswap * slippageTolerance) / 100n - gasCost;
        const effectiveAmountOutSushiswap = (amountOutSushiswap * slippageTolerance) / 100n - gasCost;

        // Calculating potential profit
        const potentialProfitSushiswap = effectiveAmountOutSushiswap - effectiveAmountOutUniswap;
        const potentialProfitUniswap = effectiveAmountOutUniswap - effectiveAmountOutSushiswap;

        console.log(`Potential Profit on Uniswap: ${ethers.formatEther(potentialProfitUniswap.toString())} ETH`);
        console.log(`Potential Profit on Sushiswap: ${ethers.formatEther(potentialProfitSushiswap.toString())} ETH`);

        if (potentialProfitSushiswap > 0n && potentialProfitSushiswap > potentialProfitUniswap) {
            return {
                hasOpportunity: true,
                direction: 'UNISWAP_TO_SUSHISWAP',
                amount: effectiveAmountOutSushiswap // Adjust this as needed
            };
        } else if (potentialProfitUniswap > 0n) {
            return {
                hasOpportunity: true,
                direction: 'SUSHISWAP_TO_UNISWAP',
                amount: effectiveAmountOutUniswap // Adjust this as needed
            };
        } else {
            return {
                hasOpportunity: false,
                direction: 'NONE',
                amount: 0n // Zero indicates no trade needed
            };
        }
    } catch (e: any) {
        console.error("Error in calculating arbitrage profit", e.message);
        return {
            hasOpportunity: false,
            direction: 'NONE',
            amount: 0n // Ensure consistency in return type
        };
    }
}



