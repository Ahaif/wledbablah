import dotenv from 'dotenv';
import { ethers } from "ethers";

import { setupBlocknative } from './monitorMempool';

dotenv.config();

export const TOKENS = {
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // Replace with actual SushiSwap router address
};

// export const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);



async function main() {

    try{
        // setupBlocknative(); listening to mempool

         //fetch data from uniswap, check for liquidity // check for arbitrage opportunity
        const amountIn = ethers.utils.parseEther("1"); // For 1 token, adjust as necessary
        

    }catch(e: any){
        console.log(e.message);
        console.log("Error in main");
    }
   


    
}

main().catch(console.error);


