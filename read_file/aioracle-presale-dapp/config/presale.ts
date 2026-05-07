export const PRESALE_CONFIG = {
  stages: 15,
  stageIncrease: 0.1,
  startPrice: Number(process.env.NEXT_PUBLIC_PRESALE_PRICE ?? '0.001'),
  currentStage: Number(process.env.NEXT_PUBLIC_PRESALE_STAGE ?? '1'),
  minPurchase: Number(process.env.NEXT_PUBLIC_MIN_PURCHASE ?? '100'),
  unlock: {
    tgePercent: 15,
    linearMonths: 12,
  },
  soldPercent: 45.2,
  remainingAio: 54_800_000,
};

export function getStagePrice(stage: number): number {
  return Number((PRESALE_CONFIG.startPrice * Math.pow(1 + PRESALE_CONFIG.stageIncrease, stage - 1)).toFixed(6));
}
