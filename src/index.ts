import dotenv from 'dotenv';
import { ethers } from "ethers";
import { calculateArbitrageProfit, fetchLiquidity, ensurePairExists } from './dexInteractions';
import { DEX_IDENTIFIERS, TOKENS, CONTRAT_ADDRESS, ERC20_ABI } from './constants';
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

    const  checkSushu = ethers.getAddress(DEX_IDENTIFIERS.SUSHISWAP);
    console.log(`Sushiswap address: ${checkSushu}`);
    const uniswapRouterContract = new ethers.Contract(DEX_IDENTIFIERS.UNISWAP, UniswapRouterABI.result, provider);
    const SushiswapRouterContract = new ethers.Contract(checkSushu, SushiswapRouterAbi.result, provider);
    
    //RPC set up
// const ganacheUrl = 'http://localhost:7545';
// const provider = new ethers.JsonRpcProvider(ganacheUrl); // Or any other provider URL
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);


async function getTokenDecimals(tokenAddress: string): Promise<number> {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    return await tokenContract.decimals();
}



async function sendEthToContract() {
    const contractAddress = CONTRAT_ADDRESS;  // Your contract address
    const sendAmount = ethers.parseEther("10");  // Amount of ETH to send
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
        console.log(`Contract funds: ${ethers.formatUnits(funds.toString(), 'ether')} ETH`)
    } catch (error) {
        throw new Error("Error checking contract owner and greeting and fund."); 
    }
}


async function initiateArbitrage(assetAddress: string, loanAmount: string, direction: string, amountOut: BigInt) {

 

    const decimals = await getTokenDecimals(assetAddress);
    const adjustedLoanAmount = ethers.parseUnits(loanAmount, decimals);
    // const adjustedAmountOut = ethers.parseUnits(amountOut, 'ether');

    // console.log(`Initiating flash loan with details:
    // Asset: ${assetAddress}
    // Loan Amount: ${loanAmount} (${decimals} decimals)
    // Direction: ${direction}
    // Amount Out: ${amountOut}
    // adjustedLoanAmount: ${adjustedLoanAmount}
    // adjustedAmountOut: ${adjustedAmountOut}`);

    // console.log(`Adjusted amount for ${decimals} decimals: ${ethers.formatUnits(adjustedLoanAmount, decimals)}`);

    // console.log(`Adjusted amount for 18 decimals DAI: ${adjustedAmountOut}`);

    
    try {
        const txResponse = await arbitrageBot.initiateFlashLoan(assetAddress, adjustedLoanAmount, direction, TOKENS.DAI, TOKENS.WETH, amountOut );
        const receipt = await txResponse.wait();
        console.log(`Transaction successful with hash: ${receipt.hash}`);
    } catch (error: any) {
        console.error(`Error initiating flash loan: ${error.message}`);
    }
}





async function main() {
    try {
        await logNetwork();
        await checkContractOwner();
        // await sendEthToContract();
        console.log("Starting Weldbablah");
        console.log("*********************************");

        const res = await ensurePairExists(TOKENS.DAI, TOKENS.WETH);
        if (!res) {
            console.log("Pair does not exist on both DEXes.");
            return;
        }

        const amount = "10"; // token amount to check token Out amount

        // Fetch amountOut for DAI -> WETH on Uniswap
        const uniAmountOut = await fetchLiquidity(TOKENS.DAI, TOKENS.WETH, amount, uniswapRouterContract, "uniswap");
        if (uniAmountOut === null) {
            console.log("Failed to fetch liquidity on Uniswap.");
            return;
        }

        // Fetch amountOut for WETH -> DAI on Sushiswap
        const sushiAmountOut = await fetchLiquidity(TOKENS.WETH, TOKENS.DAI, uniAmountOut.toString(), SushiswapRouterContract, "sushiswap");
        if (sushiAmountOut === null) {
            console.log("Failed to fetch liquidity on Sushiswap.");
            return;
        }

        const { hasOpportunity, direction, amountOutMin } = await calculateArbitrageProfit(uniAmountOut, sushiAmountOut, BigInt(amount));
        if (hasOpportunity) {
            const fundf = await arbitrageBot.checkEtherBalance();
            console.log(`Contract funds BEFORE arbitrage: ${ethers.formatUnits(fundf, 18)} WETH`);
            const fundd = await arbitrageBot.checkTokenBalance(TOKENS.DAI);
            console.log(`Contract funds BEFORE arbitrage: ${ethers.formatUnits(fundd, 18)} DAI`);

            await initiateArbitrage(TOKENS.DAI, amount, direction, amountOutMin);

            const funddd = await arbitrageBot.checkTokenBalance(TOKENS.DAI);
            console.log(`Contract funds AFTER arbitrage: ${ethers.formatUnits(funddd, 18)} DAI`);

            if (funddd > fundd) {
                console.log("Arbitrage profitable");
            } else if (funddd === fundd) {
                console.log("Arbitrage neutral");
            } else {
                console.log("Arbitrage failed");
            }
        } else {
            console.log("No profitable arbitrage opportunity found.");
        }
    } catch (e: any) {
        console.error(e.message);
        console.log("Error in main");
    }
}

main().catch(console.error);



