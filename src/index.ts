import dotenv from 'dotenv';
import { ethers } from "ethers";
import { calculateArbitrageProfit, fetchLiquidity } from './dexInteractions';
import { DEX_IDENTIFIERS, TOKENS } from './constants';
import testAbi from './contracts/ABIs/testAbi.json';
import ArbitrageBotModuleABI from './contracts/ABIs/ArbitrageBotModuleABI.json';
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import SushiswapRouterAbi from './contracts/ABIs/SushiswapAbi.json';
// import {sendFlashbotsTransaction} from './flashbot';
// import { setupBlocknative } from './monitorMempool';


dotenv.config();


if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is not set.");
}

// let  window :any; ;
// // let signer: ethers.Signer | null = null;


// connect to fork
const provider = new ethers.JsonRpcProvider(`localhost:8545`);
if (!provider) 
    throw new Error("Provider not set.");

const privateKey = process.env.PRIVATE_KEY || "";
const signer = new ethers.Wallet(privateKey, provider);
const contractAddress = `0xAE246E208ea35B3F23dE72b697D47044FC594D5F`; // Replace with your contract's address
const arbitrageBot = new ethers.Contract(contractAddress, ArbitrageBotModuleABI.abi, signer);

//dexs
const uniswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.UNISWAP, UniswapRouterABI.result, provider);
const SushiswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.SUSHISWAP, SushiswapRouterAbi.result, provider);


async function logNetwork() {
     try {
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber()
        console.log(`Connected to network: ${network.name} (${network.chainId})`);
            // const bytCode = await provider.getCode(contractAddress);
            // console.log(bytCode);

        console.log(`Block number: ${blockNumber}`);
        } catch (error) {
            console.error("Error fetching network information:", error);
    }
}
    
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

async function checkContractOwner() {
    try {
        const ownerAddress = await arbitrageBot.owner();
        console.log(`The owner of the contract is: ${ownerAddress}`);
        const greeting = await arbitrageBot.getGreeting();
        console.log(`Contract Greeting: ${greeting}`);
    } catch (error) {
        console.error("Error calling the contract:", error);
    }
}


async function initiateArbitrage(assetAddress: string, loanAmount: bigint, direction: string, amountOut: BigInt) {
    try {
        console.log(`Initiating flash loan for asset: ${assetAddress} with amount: ${loanAmount}`);
        const txResponse = await arbitrageBot.initiateFlashLoan(assetAddress, loanAmount, direction, TOKENS.DAI, TOKENS.WETH, amountOut);
        const receipt = await txResponse.wait();
        // console.log('Transaction receipt:', receipt);
        console.log(`Transaction successful with hash: ${receipt.hash}`);
    } catch (error: any) {
        console.error(`Error initiating flash loan: ${error.message}`);
        // console.error(`Full error: ${error}`);
    }
}


async function main() {

    try{
        // setupBlocknative(); listening to mempool
        // await setupProviderAndSigner(); metamask set up
         //fetch data from uniswap, check for liquidity  //not checking for reserve
        //  await logNetwork();
        //  await checkContractOwner();

         const amount: BigInt = ethers.parseEther("100000"); // Example: 1 token
        

         const uniAmountout : bigint=  await fetchLiquidity(TOKENS.DAI, TOKENS.WETH, amount, uniswapRouterContract);
         const sushiAmountout: bigint = await fetchLiquidity(TOKENS.DAI, TOKENS.WETH, amount, SushiswapRouterContract);
         if(uniAmountout === BigInt(0) || sushiAmountout === BigInt(0))
            throw new Error("No liquidity found in one of the dexs");

         const { hasOpportunity, direction, amountOut } = await calculateArbitrageProfit(uniAmountout, sushiAmountout);
         if (hasOpportunity) {
            console.log(`Arbitrage opportunity detected: ${direction} with profit: ${ethers.formatEther(amountOut.toString())} : DAI`);
             
            
        //     //implement execute trade taking in consideration direction direction: 'UNISWAP_TO_SUSHISWAP' | 'SUSHISWAP_TO_UNISWAP'
        //     const assetAddress = `0x6B175474E89094C44Da98b954EedeAC495271d0F`; // WETH address as an example
        //     const loanAmount = ethers.parseUnits("1", "ether"); // Requesting 1 E
        //     // await sendFlashbotsTransaction(assetAddress, "1", "UNISWAP_TO_SUHISWAP");  // This now sends using Flashbots
        //     await initiateArbitrage(assetAddress, loanAmount, direction, amountOut );
        }

    }catch(e: any){
        console.log(e.message);
        console.log("Error in main");
    }
    
}

main().catch(console.error);


