// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPoolAddressesProvider.sol";
import "../interfaces/IUniswapRouter.sol";
import "../interfaces/ISushiswapRouter.sol";
import "../interfaces/IPool.sol";
import "hardhat/console.sol";

contract ArbitrageBot is ReentrancyGuard, Ownable{
 
    

    IPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
    IPool public immutable POOL;

        // Defining the Uniswap and Sushiswap Router addresses
    address private constant UNISWAP_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant SUSHISWAP_ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;


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

      function checkTokenBalance(address tokenAddress) public view returns (uint256) {
        IERC20 token = IERC20(tokenAddress);
        return token.balanceOf(address(this));
    }

    function executeSwap(
        address assetIn,
        address assetOut,
        uint256 amount,
        uint256 amountOutMin,
        address routerAddress
    ) internal {

        address[] memory path = new address[](2);
        path[0] = assetIn;
        path[1] = assetOut; 

        require(IERC20(assetIn).approve(routerAddress, amount), "Approval failed");
        IUniswapRouter(routerAddress).swapExactTokensForTokens(amount, amountOutMin, path, address(this), block.timestamp);
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

        (string memory direction, address assetIn, address assetOut, uint256 amountOutMin) = abi.decode(params, (string, address, address, uint256));

        if (keccak256(bytes(direction)) == keccak256(bytes("UNISWAP_TO_SUSHISWAP"))) {
            executeSwap(assetIn, assetOut, amount, amountOutMin, UNISWAP_ROUTER);
            console.log("first swap done byed from uniswap and ready tp sell on sushiswap");
            executeSwap(assetOut, assetIn, IERC20(assetOut).balanceOf(address(this)), amountOutMin, SUSHISWAP_ROUTER);
     
        } else {
            executeSwap(assetIn, assetOut, amount, amountOutMin, SUSHISWAP_ROUTER);
            console.log("first swap done byed from sushiswap and ready to sell on uniswap");
            executeSwap(assetOut, assetIn, IERC20(assetOut).balanceOf(address(this)), amountOutMin, UNISWAP_ROUTER);
        }
        console.log("Token Balance after swap");
        console.log(checkTokenBalance(assetIn));
        finalizeOperation(asset, amount, premium);
        return true;
    }

    function finalizeOperation(address asset, uint256 amount, uint256 premium) internal {
        console.log("amount borrowed:", amount);
        uint256 amountOwing = amount + premium;
        console.log("amount owing:", amountOwing);
        require(IERC20(asset).balanceOf(address(this)) >= amountOwing, "Not enough balance to repay the loan");
        require(IERC20(asset).approve(address(POOL), amountOwing), "Approval to POOL failed");
    }


        function initiateFlashLoan(address asset, uint256 amount, string memory direction, address assetIn, address assetOut, uint256 AmountOut) public onlyOwner {
            console.log("Initiating flash loan for asset:", asset);
            console.log("Amount requested:", amount);
            require(asset != address(0), "Asset cannot be zero address");
            require(amount > 0, "Amount must be greater than 0");

            bytes memory params = abi.encode(direction, assetIn, assetOut, AmountOut);
            POOL.flashLoanSimple(address(this), asset, amount, params, 0);
        }
    }