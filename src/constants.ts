import { ethers } from 'ethers';
require('dotenv').config();

export const ERC20_ABI = [
    // balanceOf function
    "function balanceOf(address owner) view returns (uint256)",
    // decimals function
    "function decimals() view returns (uint8)"
  ];

export const DEX_IDENTIFIERS = {
    UNISWAP: `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`,
    SUSHISWAP: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', // Replace with actual SushiSwap router address
};

export const TOKENS = {
    WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`,
    DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`,
    USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`,
    USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`,
    stETH:`0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84`,
    MKR: `0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2`


};
//depolyed contract address
export const CONTRAT_ADDRESS  =`0x29023DE63D7075B4cC2CE30B55f050f9c67548d4`


//DEX factory addresses
export const UNISWAP_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
export const SUSHISWAP_FACTORY_ADDRESS = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
export const FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)"
];

// export const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);