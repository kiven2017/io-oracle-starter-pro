'use client';

import { useMemo } from 'react';
import { getStagePrice, PRESALE_CONFIG } from '@/config/presale';

export function usePresaleCalculator(amount: number) {
  return useMemo(() => {
    const price = getStagePrice(PRESALE_CONFIG.currentStage);
    const estimatedAio = amount > 0 ? Math.floor(amount / price) : 0;
    return {
      price,
      estimatedAio,
      nextPrice: getStagePrice(PRESALE_CONFIG.currentStage + 1),
      isBelowMinimum: amount > 0 && amount < PRESALE_CONFIG.minPurchase,
    };
  }, [amount]);
}
