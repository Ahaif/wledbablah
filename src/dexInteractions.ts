import dotenv from 'dotenv';
import { BigNumberish, } from "ethers";
import ethers  from 'ethers';
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import SushiswapRouterAbi from './contracts/ABIs/SushiswapAbi.json';
import { DEX_IDENTIFIERS } from './constants';
import{ArbitrageOpportunityI} from './interfaces';
import { formatEther, parseEther, getAddress } from 'ethers/lib.commonjs/utils';


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
    const tokenAAddress = ethers.utils.getAddress(tokenA);
    const tokenBAddress = ethers.utils.getAddress(tokenB);


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

    const tokenAAddress = ethers.utils.getAddress(tokenA);
    const tokenBAddress = ethers.utils.getAddress(tokenB);


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





export async function calculateArbitrageProfit(amountOutUniswap: BigInt, amountOutSushiswap: BigInt, tokenA: string, tokenB: string): Promise<ArbitrageOpportunityI> {

    const amountOutUniswapBigNumber = BigInt(amountOutUniswap.toString());
    const amountOutSushiswapBigNumber = BigInt(amountOutSushiswap.toString());


    
    try{   
       
      const slippageTolerance = 0.01; // 1%

      const currentGasPrice = await provider.getGasPrice();
      const adjustedGasPrice = currentGasPrice.mul(110).div(100); // Increase gas price by 10% for urgency

     //ignoring dynamic gas limit for now
      const estimatedGasLimit = BigInt("200000");

      // Now, perform multiplication with BigNumber objects
      const gasCostUniswap = estimatedGasLimit.mul(adjustedGasPrice);
      const gasCostSushiswap = estimatedGasLimit.mul(adjustedGasPrice);

      console.log(`Gas cost for Uniswap: ${ethers.utils.formatEther(gasCostUniswap)} ETH`);
      console.log(`Gas cost for Sushiswap: ${ethers.utils.formatEther(gasCostSushiswap)} ETH`);


        const slippageFactorUniswap = amountOutUniswapBigNumber.mul(100 - (slippageTolerance * 100)).div(100);
        const slippageFactorSushiswap = amountOutSushiswapBigNumber.mul(100 - (slippageTolerance * 100)).div(100);
        
        const effectiveAmountOutUniswap = slippageFactorUniswap.sub(gasCostUniswap);
        const effectiveAmountOutSushiswap = slippageFactorSushiswap.sub(gasCostSushiswap);

        const potentialProfitSushiswap = effectiveAmountOutSushiswap.sub(effectiveAmountOutUniswap); // Sushiswap as target
        const potentialProfitUniswap = effectiveAmountOutUniswap.sub(effectiveAmountOutSushiswap ); // Uniswap as target

        console.log(`Potential Profit on Uniswap: ${ethers.utils.formatEther(potentialProfitUniswap)}`);
        console.log(`Potential Profit on Sushiswap: ${ethers.utils.formatEther(potentialProfitSushiswap)}`);

        

        if (potentialProfitSushiswap.gt(0) && potentialProfitSushiswap.gt(potentialProfitUniswap)) {
          // There's an opportunity on Sushiswap
          return {
            hasOpportunity: true,
            direction: 'UNISWAP_TO_SUSHISWAP',
            amount: amountOutSushiswap// The amount to trade
          };
        } else if (potentialProfitUniswap.gt(0)) {
          // There's an opportunity on Uniswap
          return {
            hasOpportunity: true,
            direction: 'SUSHISWAP_TO_UNISWAP',
            amount: amountOutUniswap // The amount to trade
          };
        } else {
          // No opportunity detected
          return {
            hasOpportunity: false,
            direction: 'NONE',
            amount: ethers.constants.Zero // Zero amount indicates no trade needed
          };
        }
    }catch(e : any){
        console.log("Error in calculating arbitrage profit");
        console.log(e.message);
        return {
          hasOpportunity: false,
          direction: 'NONE',
          amount: ethers.constants.Zero // Zero amount indicates no trade needed
        };
    }
}
