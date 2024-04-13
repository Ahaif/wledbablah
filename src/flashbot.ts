import { Wallet, Contract, ethers } from "ethers";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import ArbitrageBotModuleABI from './contracts/ABIs/ArbitrageBotModuleABI.json';

// Ensure the provider and signer are correctly set up
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const privateKey = process.env.PRIVATE_KEY || "";
const signer = new ethers.Wallet(privateKey, provider);

const contractAddress = "0xAE246E208ea35B3F23dE72b697D47044FC594D5F";
const arbitrageBot = new Contract(contractAddress, ArbitrageBotModuleABI.abi, signer);

async function sendFlashbotsTransaction(assetAddress: string, loanAmount: string, direction: string) {
    // Initialize the Flashbots provider
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, signer);

    // Prepare the transaction using populateTransaction which ensures all fields are correctly set
    const txRequest = await arbitrageBot.populateTransaction.initiateFlashLoan(assetAddress, ethers.parseUnits(loanAmount, 18), direction);

    // Add necessary fields like gasLimit if not already specified by populateTransaction
       // Ensure the gas limit is set appropriately
       txRequest.gasLimit = 1000000n; 

    // Sign the transaction manually
    const signedTransaction = await signer.signTransaction(txRequest);

    // Specify the block number to target
    const blockNumber = await provider.getBlockNumber();

    // Flashbots requires signed transactions in the bundle
    const bundle = [
        signedTransaction
    ];

    // Send the bundle to Flashbots
    try {
        const bundleSubmission: any = await flashbotsProvider.sendRawBundle(bundle, blockNumber + 1);
        if (bundleSubmission.error) {
            console.error("Flashbots bundle submission error:", bundleSubmission.error);
            throw new Error('Failed to send Flashbots bundle');
        }

        console.log("Bundle submitted, waiting for inclusion...");
        const waitResponse = await bundleSubmission.wait();
        console.log('Transaction executed:', waitResponse);
    } catch (error) {
        console.error("Error sending Flashbots bundle:", error);
    }
}

export default sendFlashbotsTransaction;
