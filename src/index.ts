import dotenv from 'dotenv';
import { ethers } from "ethers";


import { calculateArbitrageProfit, fetchLiquidity, fetch_LiquiditySushiswap } from './dexInteractions';
import { TOKENS } from './constants';
import ArbitrageBotModuleABI from './contracts/ABIs/ArbitrageBotModuleABI.json';


// import { setupBlocknative } from './monitorMempool';
dotenv.config();


if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is not set.");
}

let  window :any; ;
let signer: ethers.Signer | null = null;
export let provider: any = null;


//connect to fork
    provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const privateKey = process.env.PRIVATE_KEY || "";
    signer = new ethers.Wallet(privateKey, provider);


// Metamaask set up
// async function setupProviderAndSigner() {
    

//     if (typeof window.ethereum !== 'undefined') {
//         provider = new ethers.BrowserProvider(window.ethereum)
//       try {
//         await provider.send("eth_requestAccounts", []); // Request account access if needed
//         signer = provider.getSigner();
//       } catch (error) {
//         console.error("User denied account access or an error occurred:", error);
//       }
//     } else {
//       console.log("MetaMask not installed; using read-only defaults");
//       provider = ethers.getDefaultProvider();
//     }
  
//     return { provider, signer };
//   }


//RPC set up
// const ganacheUrl = 'http://localhost:7545';
// const provider = new ethers.JsonRpcProvider(ganacheUrl); // Or any other provider URL
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);


// Contract details
const contractAddress = `0x707531c9999AaeF9232C8FEfBA31FBa4cB78d84a`; // Replace with your contract's address
const arbitrageBot = new ethers.Contract(contractAddress, ArbitrageBotModuleABI.abi, signer);
const abiCoder = ethers.AbiCoder.defaultAbiCoder();



async function checkContractOwner() {
    try {
        // Assuming your contract is `Ownable`, calling the `owner` function
        const ownerAddress = await arbitrageBot.owner();
        console.log(`The owner of the contract is: ${ownerAddress}`);
        const greeting = await arbitrageBot.getGreeting();
        console.log(`Contract Greeting: ${greeting}`);
    } catch (error) {
        console.error("Error calling the contract:", error);
    }
}


async function initiateArbitrage(assetAddress : string, loanAmount: bigint) {
    // Define additional parameters if needed, for example, the trading strategy
    const params = abiCoder.encode(
        ["address", "uint256"], // Update types based on your contract's `executeOperation` function
        [assetAddress, loanAmount] // Update values based on your needs
    );

    try {
        const tx = await arbitrageBot.initiateFlashLoan(assetAddress, loanAmount, params);
        const receipt = await tx.wait();
        console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
    } catch (error: any) {
        console.error(`Error initiating flash loan: ${error.message}`);
    }
}

async function main() {

    // while(true){
    //     console.log("Hello");
    // }

    try{
        // setupBlocknative(); listening to mempool
            // await setupProviderAndSigner(); metamask set up
         //fetch data from uniswap, check for liquidity // check for arbitrage opportunity
         //not checking for reserve
        //  const uniswapData : any=  await fetchLiquidity('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x6B175474E89094C44Da98b954EedeAC495271d0F');
        //  const sushiSwapData: any = await fetch_LiquiditySushiswap('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x6B175474E89094C44Da98b954EedeAC495271d0F')

        //  const { hasOpportunity, direction, amount } = await calculateArbitrageProfit(uniswapData, sushiSwapData, TOKENS.WETH, TOKENS.DAI);
        //  if (hasOpportunity) {

            
            
            checkContractOwner();
            
            //implement execute trade taking in consideration direction direction: 'UNISWAP_TO_SUSHISWAP' | 'SUSHISWAP_TO_UNISWAP'

            // const assetAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH address as an example
            // const loanAmount = ethers.parseUnits("1", "ether"); // Requesting 1 E
            // await initiateArbitrage(assetAddress, loanAmount);
            // console.log(`Arbitrage opportunity detected: ${direction}! Trigger Smart Contract`);
        // }

    }catch(e: any){
        console.log(e.message);
        console.log("Error in main");
    }
   


    
}

main().catch(console.error);


