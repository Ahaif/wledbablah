import { ethers } from "hardhat";

async function main() {
    // Retrieve the contract factory
    const ArbitrageBotFactory = await ethers.getContractFactory("ArbitrageBot");
    
    // Deploy the contract
    // Assuming your contract constructor requires an initial owner address,
    // you'll need to ensure a valid Ethereum address is passed here.
    // For demonstration, using the deployer's address as the initial owner.
    const [deployer] = await ethers.getSigners();
    const arbitrageBot = await ArbitrageBotFactory.deploy(deployer.address);

    // Wait for the deployment to be mined
    await arbitrageBot.deployTransaction.wait();
    
    // Log the address of the deployed contract
    console.log("ArbitrageBot deployed to:", arbitrageBot.address);
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
