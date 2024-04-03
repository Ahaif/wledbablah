const ArbitrageExecutor = artifacts.require("ArbitrageExecutor");

module.exports = function(deployer, network, accounts) {
    // Addresses of Uniswap and Sushiswap V2 Routers on Mainnet.
    // Replace these with appropriate addresses for your target network.
    const uniswapRouterAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    const sushiswapRouterAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; 

    deployer.deploy(ArbitrageExecutor, uniswapRouterAddress, sushiswapRouterAddress);
};