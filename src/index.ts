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


// connect to fork
    const provider = new ethers.JsonRpcProvider(process.env.MAINNET_FORK_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        if (!provider || !signer) 
            throw new Error("Provider not set.");
    const contractAddress = `0x00af1C57599Bd3aaF28863E7bdc4b83d21991Bb5`; // Replace with your contract's address
    const arbitrageBot = new ethers.Contract(contractAddress, ArbitrageBotModuleABI.abi, signer);
    //dexs
    const uniswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.UNISWAP, UniswapRouterABI.result, provider);
    const SushiswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.SUSHISWAP, SushiswapRouterAbi.result, provider);
    
    //RPC set up
// const ganacheUrl = 'http://localhost:7545';
// const provider = new ethers.JsonRpcProvider(ganacheUrl); // Or any other provider URL
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);



async function sendEthToContract() {
    const contractAddress = "0x00af1C57599Bd3aaF28863E7bdc4b83d21991Bb5";  // Your contract address
    const sendAmount = ethers.parseEther("0.1");  // Amount of ETH to send
    const transaction = {
        to: contractAddress,            
        value: sendAmount,             
        gasLimit: 210000,                // Gas limit - might need to be higher depending on what your contract does on receiving ETH
    };
    try {
        const txResponse = await signer.sendTransaction(transaction);  // Send the transaction
        await txResponse.wait();  // Wait for the transaction to be mined
        console.log(`Transaction successful: ${txResponse.hash}`);
    } catch (error) {
        console.error("Error sending ETH:", error);
    }
}


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
    

async function checkContractOwner() {
    try {
        const ownerAddress = await arbitrageBot.owner();
        console.log(`The owner of the contract is: ${ownerAddress}`);
        const greeting = await arbitrageBot.getGreeting();
        console.log(`Contract Greeting: ${greeting}`);
        const funds = await arbitrageBot.checkEtherBalance();
        console.log(`Contract funds: ${ethers.formatEther(funds.toString())} ETH`);
    } catch (error) {
        throw new Error("Error checking contract owner and greeting and fund."); 
    }
}


async function initiateArbitrage(assetAddress: string, loanAmount: BigInt, direction: string, amountOut: BigInt) {
    try {
        console.log(`Initiating flash loan for asset: ${assetAddress} with amount: ${ethers.formatEther(loanAmount.toString())} DAI`);
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

    
       
         await logNetwork();
          await checkContractOwner();
          await sendEthToContract();
        console.log("Starting Weldbablah");
        console.log("*********************************");

         let amount = ethers.parseEther("100"); // token amount to check token Out amount


        //  const uniAmountout  =  await fetchLiquidity(TOKENS.DAI,TOKENS.WETH, amount, uniswapRouterContract);
        //  if(uniAmountout === null)
        //  {
        //     console.log("Failed to fetch liquidity in uniswap.");
        //     return; // Exit or handle this scenario appropriately.
        //  }
        //  const sushiAmountout = await fetchLiquidity( TOKENS.DAI,TOKENS.WETH,  amount, SushiswapRouterContract);
        //  if(sushiAmountout === null)
        //  {
        //     console.log("Failed to fetch liquidity in sushiswap.");
        //     return; // Exit or handle this scenario appropriately.
        //  }

        // console.log(`initial ammountOut Uniswap: ${ethers.formatUnits(uniAmountout, 18)} WETH`);
        // console.log(`initial ammounOut Sushiswap: ${ethers.formatUnits(sushiAmountout, 18)} WETH`);
       
        // const loanAmount = ethers.parseEther("10000"); // Loan amount

        //  const { hasOpportunity, direction,  amountOutMin} = await calculateArbitrageProfit(uniAmountout, sushiAmountout, loanAmount);
        //  if (hasOpportunity) {
           
            
            // const fundsb = await arbitrageBot.checkTokenBalance(TOKENS.DAI);
           
            // console.log(`Contract funds BEFORE arbitrage: ${ethers.formatEther(fundsb.toString())} DAI`);
            // await initiateArbitrage(TOKENS.DAI, loanAmount, direction, amountOutMin);
            // await initiateArbitrage(TOKENS.DAI, amount, 'UNISWAP_TO_SUSHISWAP', ethers.parseEther("9800"));
            //  const fundsA = await arbitrageBot.checkTokenBalance(TOKENS.DAI);
            // console.log(`Contract funds AFTER  arbitrage: ${ethers.formatEther(fundsA.toString())} DAI`);
            
        // }
       //implement execute trade taking in consideration direction direction: 'UNISWAP_TO_SUSHISWAP' | 'SUSHISWAP_TO_UNISWAP'
       // await sendFlashbotsTransaction(assetAddress, "1", "UNISWAP_TO_SUHISWAP");  // This now sends using Flashbots
    //     // await initiateArbitrage(assetAddress, amount, direction, amountOut );

        
    //     console.log("*********************************");
    }catch(e: any){
        console.log(e.message);
        console.log("Error in main");
    }
    
}

main().catch(console.error);



