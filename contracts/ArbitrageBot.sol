// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPoolAddressesProvider.sol";

import "../interfaces/IPool.sol";
import "hardhat/console.sol";

contract ArbitrageBot is ReentrancyGuard, Ownable{
 
    

    IPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
    IPool public immutable POOL;

    constructor(address initialOwner, address addressesProvider) Ownable(initialOwner) {
        require(addressesProvider != address(0), "AddressesProvider cannot be zero address");
        ADDRESSES_PROVIDER = IPoolAddressesProvider(addressesProvider);
        POOL = IPool(ADDRESSES_PROVIDER.getPool());
        require(address(POOL) != address(0), "Pool cannot be zero address");
        console.log("Contract deployed by:", msg.sender);
    }

    function getGreeting() public pure returns (string memory) {
        return "Hello, Arbitrage World!";
    }

   function executeOperation(
    address asset,
    uint256 amount,
    uint256 premium,
    address initiator,
    bytes calldata params
    ) external returns (bool) {
    require(msg.sender == address(POOL), "Caller must be pool");
    require(initiator == address(this), "Initiator must be this contract");
    console.log("Initiating Execute operations:");

    uint256 amountOwing = amount + premium;
    uint256 balance = IERC20(asset).balanceOf(address(this));
    console.log("Contract balance before repayment:", balance);
    require(balance >= amountOwing, "Not enough balance to repay the loan");

    IERC20(asset).approve(address(POOL), amountOwing);
    return true;
    }

    function initiateFlashLoan(address asset, uint256 amount) public onlyOwner {

        console.log("Initiating flash loan for asset:", asset);
        console.log("Amount requested:", amount);
         require(asset != address(0), "Asset cannot be zero address");
        require(amount > 0, "Amount must be greater than 0");

        bytes memory params = ""; // Add any necessary parameters for your logic
        POOL.flashLoanSimple(address(this), asset, amount, params, 0);
    }

}