

import { network, ethers } from "hardhat";
// import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

// This script assumes you are using Hardhat and have the ethers.js library available.
async function fundContractWithUSDT(contractAddress, usdtAmount) {
    // Replace with the actual USDT contract address and a real holder from a mainnet explorer
    const usdtTokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT mainnet address
    const usdtHolderAddress = "0xF4cffBC9Dd2262dd7FF0F51b4b3ECe92A7D46c7A"; // Address of a large USDT holder

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

    // Execute the transfer
    const transferTx = await USDT.transfer(contractAddress, ethers.parseUnits(usdtAmount, 6));
    await transferTx.wait();
    console.log(`Transferred ${usdtAmount} USDT to the contract at address: ${contractAddress}`);
}

async function main() {
    const contractAddress = "0x90E75f390332356426B60FB440DF23f860F6A113"; // Replace with your contract's address
    const usdtAmount = "1000"; // Specify the amount of USDT to send
    await fundContractWithUSDT(contractAddress, usdtAmount);
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
