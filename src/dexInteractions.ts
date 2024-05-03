import dotenv from 'dotenv';
import { BigNumberish, } from "ethers";
import {ethers, JsonRpcApiProvider } from 'ethers';
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import SushiswapRouterAbi from './contracts/ABIs/SushiswapAbi.json';
import { DEX_IDENTIFIERS,
    UNISWAP_FACTORY_ADDRESS,
    SUSHISWAP_FACTORY_ADDRESS,
    FACTORY_ABI,
    PAIR_ABI,
} from './constants';
import{ArbitrageOpportunityI} from './interfaces';
import { formatEther, parseEther} from 'ethers/lib.commonjs/utils';


dotenv.config();

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey || !provider) {
  throw new Error("PRIVATE_KEY or provider environment variable is not set.");
}
// const wallet = new ethers.Wallet(privateKey, provider); 
const uniswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.UNISWAP, UniswapRouterABI.result, provider);
const SushiswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.SUSHISWAP, SushiswapRouterAbi.result, provider);
console.log("Dex contracts initialized");


// async function checkWalletBalanceForToken(walletAddress :string, tokenAddress: string, amountNeeded : BigNumber) {
//     const tokenContract = new ethers.Contract(tokenAddress, ["function balanceOf(address owner) view returns (uint256)"], provider);
//     const balance = await tokenContract.balanceOf(walletAddress);
//     return BigNumber.from(balance).gte(BigNumber.from(amountNeeded));
// }

// async function checkEthBalance(walletAddress, amountNeeded) {
//     const balance = await provider.getBalance(walletAddress);
//     return BigNumber.from(balance).gte(BigNumber.from(amountNeeded));
// }


async function getDecimals(tokenAddress: string): Promise<number> {
    const tokenContract = new ethers.Contract(tokenAddress, ['function decimals() view returns (uint8)'], provider);
    return await tokenContract.decimals();
}

async function checkPairExists(tokenA:string, tokenB:string, factoryAddress:string) {
    const factoryContract = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
    const pairAddress = await factoryContract.getPair(tokenA, tokenB);
    return pairAddress !== '0x0000000000000000000000000000000000000000';
}

export async function ensurePairExists(tokenA : string, tokenB: string) {
    try{
        const existsOnUniswap = await checkPairExists(tokenA, tokenB, UNISWAP_FACTORY_ADDRESS);
        const existsOnSushiswap = await checkPairExists(tokenA, tokenB, SUSHISWAP_FACTORY_ADDRESS);
    
        if (!existsOnUniswap || !existsOnSushiswap) {
            
            console.error(`Pair does not exist on both DEXes for tokens: ${tokenA} and ${tokenB}`);
            throw new Error(`Pair does not exist on both DEXes for tokens: ${tokenA} and ${tokenB}`);
        }
    
        console.log(`Pair exists on both Uniswap and Sushiswap for tokens: ${tokenA} and ${tokenB}`);
        return true;

    }catch(e:any){
        console.error(`Error checking pair existence: ${e.message}`);
        throw e.message;

}
}




export async function fetchLiquidity(tokenA: string, tokenB: string, nominalAmount: string, dexContract: ethers.Contract, dex :string): Promise<bigint | null> {
    try {
     
        const decimalsA = await getDecimals(tokenA);
        const amount = BigInt(nominalAmount) * BigInt(10) ** BigInt(decimalsA);
        let factoryContract;
        let pairAddress;
        let pairContract;
        let reserves;
        let reserves0;
        let reserves1;

        if (!dexContract.getAmountsOut) {
            console.error("getAmountsOut function is not available on the provided contract.");
            return null; 
        }


        if(dex === 'uniswap'){
            factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, FACTORY_ABI, provider);
            pairAddress = await factoryContract.getPair(tokenA, tokenB);
             pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
             reserves = await pairContract.getReserves();
             reserves0 = BigInt(reserves.reserve0);
             reserves1 = BigInt(reserves.reserve1);
            console.log("------------------------UNISWAP RESERVE------------------------")
            console.log('reserve0 of tokenA',ethers.formatUnits(reserves0, 'ether'));
            console.log('reserve1 of TokenB',ethers.formatUnits(reserves1, 'ether'));
        }else
        {
            factoryContract = new ethers.Contract(SUSHISWAP_FACTORY_ADDRESS, FACTORY_ABI, provider);
             pairAddress = await factoryContract.getPair(tokenA, tokenB);
             pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
             reserves = await pairContract.getReserves();
            reserves0 = BigInt(reserves.reserve0);
             reserves1 = BigInt(reserves.reserve1);
            console.log("------------------------SUSHISWAP RESERVE------------------------")
            console.log('reserve0 of tokenA',ethers.formatUnits(reserves0, 'ether'));
            console.log('reserve1 of TokenB',ethers.formatUnits(reserves1, 'ether'));
  
        }
        // Determine the correct order of reserves
        const [tokenAReserve, tokenBReserve] = tokenA < tokenB ? [reserves0, reserves1] : [reserves1, reserves0];
        // Check if reserves are sufficient
        if (tokenAReserve < amount || tokenBReserve < amount) {
            console.error("Insufficient liquidity for this trade.");
            return null;
        }
        const amountsOut = await dexContract.getAmountsOut(amount, [tokenA, tokenB]);
        if (amountsOut && amountsOut.length > 1 && amountsOut[1] > BigInt(0)) {
            return amountsOut[1];
        } else {
            console.error(`No liquidity available for token pair: ${tokenA} - ${tokenB}`);
            return null; 
        }
    } catch (error:any) {
        console.error(`Error fetching liquidity from dex: ${error.message}`);
        return null; 
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
    loanAmount: bigint,
    slippageTolerance: bigint = 2n
): Promise<ArbitrageOpportunityI> {
    try {
        console.log("****************************************");
        console.log("Calculating Arbitrage Opportunity Profit");

        // Constants
        const flashLoanFeeRate: bigint = 9n; // 0.09% expressed as 0.09 * 100 to avoid floating point operations
        const basisPoint: bigint = 10000n; // Basis points conversion factor

        // Calculate the flash loan fee
        const flashLoanFee: bigint = loanAmount * flashLoanFeeRate / basisPoint;

        console.log(`Flash loan fee: ${ethers.formatUnits(flashLoanFee, 'ether')} ETH`);

        // Gas and slippage calculations
        const feeData = await provider.getFeeData();
        const adjustedGasPrice = BigInt(feeData.maxFeePerGas?.toString() || feeData.gasPrice?.toString() || '0') * BigInt(110) / BigInt(100);
        const estimatedGasLimit = BigInt(210000); // Adjusted gas limit for complex transactions
        const totalGasCost = adjustedGasPrice * estimatedGasLimit * BigInt(2); // Two swaps

        const slippageFactor: bigint = BigInt(100) - slippageTolerance;
        const effectiveAmountOutUniswap = (amountOutUniswap * slippageFactor / BigInt(100)) - totalGasCost - flashLoanFee;
        const effectiveAmountOutSushiswap = (amountOutSushiswap * slippageFactor / BigInt(100)) - totalGasCost - flashLoanFee;

        console.log(`Effective amount out Uniswap: ${ethers.formatUnits(effectiveAmountOutUniswap, 'ether')} `);
        console.log(`Effective amount out Sushiswap: ${ethers.formatUnits(effectiveAmountOutSushiswap, 'ether')} `);

        const grossProfitUniswap = effectiveAmountOutUniswap - effectiveAmountOutSushiswap;
        const grossProfitSushiswap = effectiveAmountOutSushiswap - effectiveAmountOutUniswap;

        if (grossProfitUniswap > 0n) {
            console.log('Gross profit Uniswap:', ethers.formatUnits(grossProfitUniswap, 'ether'));
            return { hasOpportunity: true, direction: 'UNISWAP_TO_SUSHISWAP', amountOutMin: effectiveAmountOutUniswap };
        } else if (grossProfitSushiswap > 0n) {
            console.log('Gross profit Sushiswap:', ethers.formatUnits(grossProfitSushiswap, 'ether'));
            return { hasOpportunity: true, direction: 'SUSHISWAP_TO_UNISWAP', amountOutMin: effectiveAmountOutSushiswap };
        } else {
            console.log("No profitable arbitrage opportunity found.");
            return { hasOpportunity: false, direction: 'NONE', amountOutMin: 0n };
        }
    } catch (error: any) {
        console.error("Error in calculating arbitrage profit", error.message);
        return { hasOpportunity: false, direction: 'NONE', amountOutMin: 0n };
    }
}
