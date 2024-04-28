import { network, ethers } from "hardhat";
// import { ethers } from "ethers";
import * as dotenv from "dotenv";
import {CONTRAT_ADDRESS, TOKENS} from '../src/constants';
dotenv.config();


const DaiHolderAddress = "0x6FF8E4DB500cBd77d1D181B8908E022E29e0Ec4A"
const UsdtHolderAddress = `0xa7C0D36c4698981FAb42a7d8c783674c6Fe2592d`
const UsdcHolderAddress = `0xDFd5293D8e347dFe59E90eFd55b2956a1343963d`
const stETHHolderAddress = `0x02eD4a07431Bcc26c5519EbF8473Ee221F26Da8b`
const WethHolderAddress = `0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3`



dotenv.config();

async function fundHolderWithETH(daiHolderAddress: string, ethAmount: string) {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY environment variable is not set.");
    }
    const signer = new ethers.Wallet(privateKey, provider);

    console.log(`Sending ${ethAmount} ETH to account for gas fees...`);
    const tx = await signer.sendTransaction({
        to: daiHolderAddress,
        value: ethers.parseEther(ethAmount)
    });
    await tx.wait();
    console.log("ETH transferred successfully.");
}

async function fundContract(tokenAddress, tokenHolderAddress, amount, contractAddress) {
    try {
        // await fundHolderWithETH(tokenHolderAddress, "1"); // Ensure the holder has ETH for gas
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [tokenHolderAddress]
        });

        const signer = await ethers.getSigner(tokenHolderAddress);
        const tokenContract = new ethers.Contract(tokenAddress, [
            "function balanceOf(address) external view returns (uint256)",
            "function transfer(address to, uint256 amount) external returns (bool)",
            "function decimals() external view returns (uint8)"
        ], signer);

        const decimals = await tokenContract.decimals();
        const balance = await tokenContract.balanceOf(tokenHolderAddress);
        console.log(`Holder's token Balance: ${ethers.formatUnits(balance, decimals)}`);

        const transferAmount = ethers.parseUnits(amount, decimals);
        // if (transferAmount.gt(balance)) {
        //     throw new Error("Insufficient token balance for the transfer.");
        // }

        const transferTx = await tokenContract.transfer(contractAddress, transferAmount);
        await transferTx.wait();
        console.log(`Successfully transferred ${amount} tokens to the contract at address: ${contractAddress}`);
    } catch (error) {
        console.error("Error in fundContract:", error.message);
        throw error;
    }
}

async function main() {
    const contractAddress = CONTRAT_ADDRESS;
    const tokenAddress = TOKENS.DAI;
    const tokenHolderAddress = DaiHolderAddress;
    const amount = "100";
    await fundContract(tokenAddress, tokenHolderAddress, amount, contractAddress);
}

main().catch((error) => {
    console.error("Final Error:", error);
    process.exit(1);
});


