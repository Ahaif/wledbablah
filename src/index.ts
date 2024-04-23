import dotenv from 'dotenv';
import { ethers } from "ethers";
import { calculateArbitrageProfit, fetchLiquidity } from './dexInteractions';
import { DEX_IDENTIFIERS, TOKENS, CONTRAT_ADDRESS } from './constants';
import testAbi from './contracts/ABIs/testAbi.json';
import ArbitrageBotModuleABI from './contracts/ABIs/ArbitrageBotModuleABI.json';
import UniswapRouterABI from './contracts/ABIs/UniswapRouter.json';
import SushiswapRouterAbi from './contracts/ABIs/SushiswapAbi.json';
// import {sendFlashbotsTransaction} from './flashbot';
// import { setupBlocknative } from './monitorMempool';


dotenv.config();
if(!process.env.MAINNET_FORK_URL || !process.env.PRIVATE_KEY)
    throw new Error("Please set the MAINNET_FORK_URL and PRIVATE_KEY environment variables.");


// connect to fork
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        if (!provider || !signer) 
            throw new Error("Provider not set.");
    const contractAddress = CONTRAT_ADDRESS; // Replace with your contract's address
    const arbitrageBot = new ethers.Contract(contractAddress, ArbitrageBotModuleABI.abi, signer);
    //dexs
    const uniswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.UNISWAP, UniswapRouterABI.result, provider);
    const SushiswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.SUSHISWAP, SushiswapRouterAbi.result, provider);
    
    //RPC set up
// const ganacheUrl = 'http://localhost:7545';
// const provider = new ethers.JsonRpcProvider(ganacheUrl); // Or any other provider URL
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);



async function sendEthToContract() {
    const contractAddress = CONTRAT_ADDRESS;  // Your contract address
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
        // const funds = await arbitrageBot.checkEtherBalance();
        // console.log(`Contract funds: ${ethers.formatEther(funds.toString())} ETH`);
    } catch (error) {
        throw new Error("Error checking contract owner and greeting and fund."); 
    }
}


async function initiateArbitrage(assetAddress: string, loanAmount: bigint, direction: string, amountOut: bigint) {
    try {
        console.log(`Initiating flash loan for asset: ${assetAddress} with amount: ${ethers.formatUnits(loanAmount, 6)} ETH`);
        const txResponse = await arbitrageBot.initiateFlashLoan(assetAddress, loanAmount, direction, TOKENS.USDT, TOKENS.USDC, amountOut);
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
        //   await sendEthToContract();
        ethers.getAddress(TOKENS.USDT);
        ethers.getAddress(TOKENS.USDC);
        console.log(ethers.getAddress(TOKENS.USDT))
        console.log(ethers.getAddress(TOKENS.USDC))
    
        console.log("Starting Weldbablah");
        console.log("*********************************");

         let amount = ethers.parseEther("500"); // token amount to check token Out amount


        //  const uniAmountout  =  await fetchLiquidity(TOKENS.USDT,TOKENS.USDC, amount, uniswapRouterContract);
        //  if(uniAmountout === null)
        //  {
        //     console.log("Failed to fetch liquidity in uniswap.");
        //     return; // Exit or handle this scenario appropriately.
        //  }
        //  const sushiAmountout = await fetchLiquidity( TOKENS.USDT,TOKENS.USDC,  amount, SushiswapRouterContract);
        //  if(sushiAmountout === null)
        //  {
        //     console.log("Failed to fetch liquidity in sushiswap.");
        //     return; // Exit or handle this scenario appropriately.
        //  }

        // console.log(`initial ammountOut Uniswap: ${ethers.formatUnits(uniAmountout, 18)} WETH`);
        // console.log(`initial ammounOut Sushiswap: ${ethers.formatUnits(sushiAmountout, 18)} WETH`);
       
        const loanAmount = ethers.parseEther("200"); // Amount of USDT to borrow for arbitrage

        //  const { hasOpportunity, direction,  amountOutMin} = await calculateArbitrageProfit(uniAmountout, sushiAmountout, loanAmount);
        //  if (hasOpportunity) {
           
            
            const fundsb = await arbitrageBot.checkTokenBalance(TOKENS.USDT);
           
            console.log(`Contract funds BEFORE arbitrage: ${ethers.formatUnits(fundsb, 6)} USDT`);
            // await initiateArbitrage(TOKENS.DAI, loanAmount, direction, amountOutMin);
            await initiateArbitrage(TOKENS.USDT, loanAmount, 'UNISWAP_TO_SUSHISWAP', 400n);
             const fundsA = await arbitrageBot.checkTokenBalance(TOKENS.USDT);
            console.log(`Contract funds AFTER  arbitrage: ${ethers.formatUnits(fundsA,6)} USDT`);
            
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



