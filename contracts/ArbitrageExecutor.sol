// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract ArbitrageExecutor {
    address owner;
    IUniswapV2Router uniswapRouter;
    IUniswapV2Router sushiswapRouter;

    constructor(address _uniswapRouter, address _sushiswapRouter) {
        owner = msg.sender;
        uniswapRouter = IUniswapV2Router(_uniswapRouter);
        sushiswapRouter = IUniswapV2Router(_sushiswapRouter);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }

    function executeTrade(
        bool isUniswapToSushiswap,
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external onlyOwner {
        if (isUniswapToSushiswap) {
            // Execute trade from Uniswap to Sushiswap
            uniswapRouter.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
        } else {
            // Execute trade from Sushiswap to Uniswap
            sushiswapRouter.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
        }
    }

    // Function to allow the contract to receive ETH
    receive() external payable {}

    // Withdraw ETH from the contract to the owner address
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
