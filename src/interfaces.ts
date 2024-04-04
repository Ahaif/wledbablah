
export interface ArbitrageOpportunityI {
    hasOpportunity: boolean;
    direction: 'UNISWAP_TO_SUSHISWAP' | 'SUSHISWAP_TO_UNISWAP' | 'NONE';
    amount: BigInt; // This should be the amount to use for the flash loan
  }