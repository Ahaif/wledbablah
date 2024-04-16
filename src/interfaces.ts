
export interface ArbitrageOpportunityI {
    hasOpportunity: boolean;
    direction: 'UNISWAP_TO_SUSHISWAP' | 'SUSHISWAP_TO_UNISWAP' | 'NONE';
    amountOutMin: BigInt;
    // amountOutMinUniswap: BigInt;
    // amountOutMinSushiswap: BigInt // This should be the amount to use for the flash loan
  }