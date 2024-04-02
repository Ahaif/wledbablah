import { BigNumber } from 'ethers';
export interface ArbitrageOpportunityI {
    hasOpportunity: boolean;
    direction: 'UNISWAP_TO_SUSHISWAP' | 'SUSHISWAP_TO_UNISWAP' | 'NONE';
    amount: BigNumber; // This should be the amount to use for the flash loan
  }