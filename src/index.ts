// const ethers = require('ethers');

// // Assuming you're using the Uniswap V2 router
// const uniswapRouterAddress = "0x...";
// const uniswapRouterABI = [...] // Fill in the Uniswap V2 Router ABI

// // Simplified pair ABI focusing on `getReserves`
// const pairABI = [
//   {
//     "constant": true,
//     "inputs": [],
//     "name": "getReserves",
//     "outputs": [
//       { "internalType": "uint112", "name": "_reserve0", "type": "uint112" },
//       { "internalType": "uint112", "name": "_reserve1", "type": "uint112" },
//       { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }
//     ],
//     "payable": false,
//     "stateMutability": "view",
//     "type": "function"
//   }
// ];

// // Setup provider (using Infura, Alchemy, or another Ethereum node provider)
// const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

// // Setup the contract instance
// const router = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, provider);

// // Function to get reserves for a pair
// async function getReserves(tokenA, tokenB) {
//     const pairAddress = await router.getPair(tokenA, tokenB);
//     const pairContract = new ethers.Contract(pairAddress, pairABI, provider);

//     const reserves = await pairContract.getReserves();
//     console.log(reserves);
// }

// // Function to calculate slippage
// function calculateSlippage(amountIn, reserveIn, reserveOut) {
//     // Simplified formula: (amountIn * reserveOut) / (reserveIn + amountIn)
//     // This does not account for transaction fees or other in-depth factors
//     const amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
//     return amountOut; // This returns the expected output amount, not the slippage percentage
// }

// // Example usage
// const tokenA = "0x..."; // Replace with actual tokenA address
// const tokenB = "0x..."; // Replace with actual tokenB address
// getReserves(tokenA, tokenB);

// // To use calculateSlippage, you'll need the reserve amounts and input amount, for example:
// // let amountIn = ethers.utils.parseUnits("1", 18); // 1 token, assuming 18 decimal places
// // let slippageAmount = calculateSlippage(amountIn, reserveIn, reserveOut);
// // console.log(slippageAmount);




import { ethers } from 'ethers';
require('dotenv').config();



// Replace 'rinkeby' with your network of choice: mainnet, ropsten, etc.
const network = 'rinkeby';
const providerUrl = `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
const provider = new ethers.providers.JsonRpcProvider(providerUrl);

async function main() {
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current block number on ${network}: ${blockNumber}`);
}

main().catch(console.error);