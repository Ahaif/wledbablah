import { network, ethers } from "hardhat";
// import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();


async function fundDAIHolderWithETH(daiHolderAddress: string, ethAmount: string) {
    const provider = new ethers.JsonRpcProvider();
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Private key of the account with 100 ETH
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
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI token address on Ethereum mainnet
    const daiHolderAddress = "0x837c20D568Dfcd35E74E5CC0B8030f9Cebe10A28"; // Address of a large DAI holder
    try{
        await fundDAIHolderWithETH(daiHolderAddress, "15"); // Send 0.1 ETH to DAI holder for gas

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
        const contractAddress = "0xa1e757125a93160e6dcaD78af4641e6796C4463e"; // Replace with your contract's address
        await fundContractWithDAI(contractAddress, "1000"); // Amount of DAI you want to transfer
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
