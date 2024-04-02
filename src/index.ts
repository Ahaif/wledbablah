import dotenv from 'dotenv';
import { ethers } from "ethers";
import { BigNumber } from 'ethers';
import { calculateArbitrageProfit, fetchLiquidity, fetch_LiquiditySushiswap } from './dexInteractions';
import { TOKENS } from './constants';

// import { setupBlocknative } from './monitorMempool';

dotenv.config();




async function main() {

    try{
        // setupBlocknative(); listening to mempool
        const weth = ethers.utils.getAddress(TOKENS.WETH);
        const dai = ethers.utils.getAddress(TOKENS.DAI);
        console.log(weth);
        console.log(dai);

         //fetch data from uniswap, check for liquidity // check for arbitrage opportunity
         const uniswapData : any=  await fetchLiquidity('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x6B175474E89094C44Da98b954EedeAC495271d0F');
         const sushiSwapData: any = await fetch_LiquiditySushiswap('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x6B175474E89094C44Da98b954EedeAC495271d0F')

            await calculateArbitrageProfit(uniswapData, sushiSwapData, TOKENS.WETH, TOKENS.DAI);

    }catch(e: any){
        console.log(e.message);
        console.log("Error in main");
    }
   


    
}

main().catch(console.error);


