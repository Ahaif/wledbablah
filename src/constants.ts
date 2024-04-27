import { ethers } from 'ethers';
require('dotenv').config();

export const ERC20_ABI = [
    // balanceOf function
    "function balanceOf(address owner) view returns (uint256)",
    // decimals function
    "function decimals() view returns (uint8)"
  ];

export const DEX_IDENTIFIERS = {
    UNISWAP: '0x86dcd3293C53Cf8EFd7303B57beb2a3F671dDE98',
    SUSHISWAP: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', // Replace with actual SushiSwap router address
};

export const TOKENS = {
    WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`,
    DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`,
    USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`,
    USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`,
};

export const CONTRAT_ADDRESS  =`0xf93b0549cD50c849D792f0eAE94A598fA77C7718`

// export const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);