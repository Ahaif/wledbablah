import { network, ethers } from "hardhat";
// import { ethers } from "ethers";
import * as dotenv from "dotenv";
import {CONTRAT_ADDRESS, TOKENS} from '../src/constants';
dotenv.config();


async function fundDAIHolderWithETH(daiHolderAddress: string, ethAmount: string) {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const privateKey = process.env.PRIVATE_KEY || ""; // Private key of the account with 100 ETH
    const signer = new ethers.Wallet(privateKey, provider);

    console.log(`Sending ${ethAmount} ETH to DAI holder for gas fees...`);
    const tx = await signer.sendTransaction({
        to: daiHolderAddress,
        value: ethers.parseEther(ethAmount)
    });
    await tx.wait();
    console.log("ETH transferred to DAI holder.");
}

async function fundContractWithDAI(contractAddress: string, daiAmount: string) {
    const daiTokenAddress = TOKENS.DAI; // DAI token address on Ethereum mainnet
    const daiHolderAddress = "0x6FF8E4DB500cBd77d1D181B8908E022E29e0Ec4A"; // Address of a large DAI holder
    try{
        // await fundDAIHolderWithETH(daiHolderAddress, "5"); // Send 0.1 ETH to DAI holder for gas

    // Impersonate the DAI holder
        await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [daiHolderAddress]
    });

        const signer = await ethers.getSigner(daiHolderAddress);
        const DAI = new ethers.Contract(daiTokenAddress, [
        "function balanceOf(address) external view returns (uint256)",
        "function transfer(address, uint256) external returns (bool)"
    ], signer);

    // Check DAI balance before attempting to transfer
    const balance = await DAI.balanceOf(daiHolderAddress);
    console.log(`DAI Holder Balance: ${ethers.formatEther(balance)} DAI`);

    // Execute transfer
    // if (balance.lt(ethers.parseEther(daiAmount))) {
    //     throw new Error("Not enough DAI balance in the impersonated account to perform the transfer.");
    // }

    const transferTx = await DAI.transfer(contractAddress, ethers.parseEther(daiAmount));
    await transferTx.wait();
    console.log(`Transferred ${daiAmount} DAI to the contract at address: ${contractAddress}`);

    }catch(error : any)
    {
        console.log("Error: ", error.message);
    }

}

async function main() {
    try{
        const contractAddress = CONTRAT_ADDRESS; // Replace with your contract's address
        await fundContractWithDAI(contractAddress, "500"); // Amount of DAI you want to transfer
    }
    catch(error : any)
    {
        console.log("Error: ", error.message);
    }
    
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
