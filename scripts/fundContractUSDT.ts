

import { network, ethers } from "hardhat";
// import { ethers } from "ethers";
import * as dotenv from "dotenv";

import {CONTRAT_ADDRESS, TOKENS} from '../src/constants';

dotenv.config();

// This script assumes you are using Hardhat and have the ethers.js library available.
async function fundContractWithUSDT(contractAddress, usdtAmount) {
    // Replace with the actual USDT contract address and a real holder from a mainnet explorer
    const usdtTokenAddress = TOKENS.USDT; 
    const usdtHolderAddress = `0xa7C0D36c4698981FAb42a7d8c783674c6Fe2592d`; // Address of a large USDT holder

    // Impersonate the USDT holder
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [usdtHolderAddress]
    });

    const signer = await ethers.getSigner(usdtHolderAddress);
    const USDT = new ethers.Contract(usdtTokenAddress, [
        "function balanceOf(address) external view returns (uint256)",
        "function transfer(address to, uint amount) external returns (bool)"
    ], signer);

    // Check USDT balance before attempting to transfer
    const balance : bigint = await USDT.balanceOf(usdtHolderAddress);
    console.log(`USDT Holder Balance: ${ethers.formatUnits(balance, 6)} USDT`);

    // Check if the balance is sufficient for the transfer
    if (usdtAmount >= balance) {
        throw new Error("Not enough USDT balance in the impersonated account to perform the transfer.");
    }

    const adjustUsdtAmount = ethers.parseUnits(usdtAmount, 6);

    // Execute the transfer
    const transferTx = await USDT.transfer(contractAddress,adjustUsdtAmount);
    await transferTx.wait();
    console.log(`Transferred ${usdtAmount} USDT to the contract at address: ${contractAddress}`);
}

async function main() {
    const contractAddress = CONTRAT_ADDRESS; // Replace with your contract's address
    const usdtAmount = "10000"; // Specify the amount of USDT to send
   
    await fundContractWithUSDT(contractAddress, usdtAmount);
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
