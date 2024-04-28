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


};

export const CONTRAT_ADDRESS  =`0x8CeA85eC7f3D314c4d144e34F2206C8Ac0bbadA1`

// export const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);