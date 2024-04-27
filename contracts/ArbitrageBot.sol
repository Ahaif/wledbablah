// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPoolAddressesProvider.sol";
import "../interfaces/IUniswapRouter.sol";
import "../interfaces/ISushiswapRouter.sol";
import "../interfaces/IPool.sol";
import "hardhat/console.sol";

contract ArbitrageBot is ReentrancyGuard, Ownable {
    IPoolAddressesProvider public immutable addressesProvider;
    IPool public immutable pool;

    address private constant UNISWAP_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant SUSHISWAP_ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;

    constructor(address initialOwner, address _addressesProvider) Ownable(initialOwner) {
        require(_addressesProvider != address(0), "AddressesProvider cannot be zero address");
        addressesProvider = IPoolAddressesProvider(_addressesProvider);
        pool = IPool(addressesProvider.getPool());
        require(address(pool) != address(0), "Pool cannot be zero address");
    }

    receive() external payable {}

    fallback() external payable {}
    
    function checkEtherBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getGreeting() public pure returns (string memory) {
        return "Hello, Arbitrage World!";
    }

    function checkTokenBalance(address tokenAddress) public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    

    function executeSwap(
        address assetIn,
        address assetOut,
        uint256 amount,
        uint256 amountOutMin,
        address routerAddress
    ) internal returns (uint256[] memory) {
        IERC20(assetIn).approve(routerAddress, amount);
        address[] memory path = new address[](2);
        path[0] = assetIn;
        path[1] = assetOut;
        return IUniswapRouter(routerAddress).swapExactTokensForTokens(amount, amountOutMin, path, address(this), block.timestamp);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external nonReentrant returns (bool) {
        require(msg.sender == address(pool), "Caller must be pool");
        require(initiator == address(this), "Initiator must be this contract");

        // (string memory direction, address assetIn, address assetOut, uint256 amountOutMin) = abi.decode(params, (string, address, address, uint256));

        // if (keccak256(bytes(direction)) == keccak256(bytes("UNISWAP_TO_SUSHISWAP"))) {
        //     executeSwap(assetIn, assetOut, amount, amountOutMin, UNISWAP_ROUTER);
        //     executeSwap(assetOut, assetIn, IERC20(assetOut).balanceOf(address(this)), amountOutMin, SUSHISWAP_ROUTER);
        // } else {
        //     executeSwap(assetIn, assetOut, amount, amountOutMin, SUSHISWAP_ROUTER);
        //     executeSwap(assetOut, assetIn, IERC20(assetOut).balanceOf(address(this)), amountOutMin, UNISWAP_ROUTER);
        // }

        finalizeOperation(asset, amount, premium);
        return true;
    }

    function finalizeOperation(address asset, uint256 amount, uint256 premium) internal {

        uint256 amountOwing = amount + premium;
        console.log("Amount owing: %d", amountOwing);
        console.log("amount: %d", amount);
        console.log("premium: %d", premium);
        require(IERC20(asset).balanceOf(address(this)) >= amountOwing, "Insufficient balance to repay loan");
        IERC20(asset).approve(address(pool), amountOwing);
        console.log("Repaying loan done");
    }
    
   function initiateFlashLoan(
    address asset, 
    uint256 amount, 
    string memory direction, 
    address assetIn, 
    address assetOut, 
    uint256 amountOut
) public onlyOwner {
    IERC20 token = IERC20(asset);
    uint256 balance = token.balanceOf(address(this));
    require(balance >= amount, "Insufficient token balance for flash loan");

    // Calculate a safe amount to approve, considering possible fees
    uint256 safeApprovalAmount = amount * 2; // Double the amount to cover the loan and any potential fees

    // Reset and set the allowance
    token.approve(address(pool), 0); // Some tokens require resetting to 0 first
    token.approve(address(pool), safeApprovalAmount);

    console.log("Setting allowance for pool: %s", safeApprovalAmount);
    console.log("Attempting flash loan with balance: %s", balance);

    // Encode parameters and initiate the flash loan
    bytes memory params = abi.encode(direction, assetIn, assetOut, amountOut);
    pool.flashLoanSimple(address(this), asset, amount, params, 0);

    // console.log("Loan initiated with params: %s", params);
}

}
