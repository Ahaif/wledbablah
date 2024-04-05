// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ILendingPoolAddressesProvider.sol";
import "../interfaces/ILendingPool.sol";
import "../interfaces/IFlashLoanSimpleReceiver.sol";


contract ArbitrageBot is ReentrancyGuard, Ownable,IFlashLoanSimpleReceiver {
    address private constant AAVE_LENDING_POOL_ADDRESSES_PROVIDER = address(0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5);
    address private constant UNISWAP_ROUTER = address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    address private constant SUSHISWAP_ROUTER = address(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    ILendingPoolAddressesProvider private addressesProvider;
    ILendingPool private lendingPool;

    

    constructor(address initialOwner) Ownable(initialOwner) {
        addressesProvider = ILendingPoolAddressesProvider(AAVE_LENDING_POOL_ADDRESSES_PROVIDER);
        lendingPool = ILendingPool(addressesProvider.getLendingPool());
    }
     // A simple view function to test contract connectivity
    function getGreeting() public pure returns (string memory) {
        return "Hello, Arbitrage World!";
    }

    function initiateFlashLoan(address asset, uint256 amount, bytes calldata params) public onlyOwner {
       
        lendingPool.flashLoanSimple(address(this), asset, amount, params, 0);
    }

    // Callback function that Aave calls after issuing the flash loan
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Ensure the call is from the LendingPool and the initiator is this contract
        require(msg.sender == address(lendingPool), "Call must come from LendingPool");
        require(initiator == address(this), "Initiator must be this contract");

        // Example operation with borrowed funds
        // Your logic here: e.g., arbitrage

        // Repay the flash loan (amount + premium)
        uint256 amountOwing = amount + premium;
        IERC20(asset).approve(address(lendingPool), amountOwing);

        return true;
    }

}