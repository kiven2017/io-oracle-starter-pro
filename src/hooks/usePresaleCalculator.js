import { useMemo } from 'react'
import {
  NETWORKS,
  PRESALE_CONFIG,
  getNextStagePrice,
  getStagePrice,
  getTokenOptionsForNetwork,
} from '../data/presaleConfig'
import { evaluatePromoCode } from '../lib/promoCodes'

export default function usePresaleCalculator({
  amount,
  networkId,
  tokenSymbol,
  promoCode,
  availableTokens: availableTokensOverride,
}) {
  return useMemo(() => {
    const availableTokens = availableTokensOverride?.length
      ? availableTokensOverride
      : getTokenOptionsForNetwork(networkId)
    const selectedToken =
      availableTokens.find((token) => token.symbol === tokenSymbol) ??
      availableTokens[0] ??
      null
    const selectedNetwork = NETWORKS.find((network) => network.id === networkId) ?? NETWORKS[0]
    const amountNumber = Number.isFinite(amount) ? amount : 0
    const price = getStagePrice(PRESALE_CONFIG.currentStage)
    const usdEquivalent = Number((amountNumber * (selectedToken?.usdRate ?? 0)).toFixed(2))
    const estimatedAioBase = usdEquivalent > 0 ? Math.floor(usdEquivalent / price) : 0
    const promoEvaluation = evaluatePromoCode({
      promoCode,
      usdEquivalent,
      baseEstimatedAio: estimatedAioBase,
    })
    const estimatedAio = promoEvaluation.estimatedAio
    const tgeUnlock = Math.floor(estimatedAio * (PRESALE_CONFIG.unlock.tgePercent / 100))
    const vestedAmount = Math.max(estimatedAio - tgeUnlock, 0)
    const monthlyUnlock = Math.floor(vestedAmount / PRESALE_CONFIG.unlock.linearMonths)
    const hasPromoCodeIssue =
      promoEvaluation.status === 'invalid_code' || promoEvaluation.status === 'below_threshold'
    const isBelowMinimum = amountNumber > 0 && usdEquivalent < PRESALE_CONFIG.minPurchaseUsd

    return {
      availableTokens,
      selectedToken,
      selectedNetwork,
      amountNumber,
      price,
      nextPrice: getNextStagePrice(PRESALE_CONFIG.currentStage),
      usdEquivalent,
      estimatedAioBase,
      estimatedAio,
      tgeUnlock,
      vestedAmount,
      monthlyUnlock,
      isBelowMinimum,
      canReview: amountNumber > 0 && !isBelowMinimum && !hasPromoCodeIssue,
      promoId: promoEvaluation.promoId,
      promoCodeNormalized: promoEvaluation.promoCode,
      promoCodeStatus: promoEvaluation.status,
      promoCodeRule: promoEvaluation.rule,
      promoBonusPercent: promoEvaluation.bonusPercent,
      promoBonusAio: promoEvaluation.bonusAio,
      hasPromoCodeIssue,
      validPromoCodes: promoEvaluation.validCodes,
    }
  }, [amount, availableTokensOverride, networkId, tokenSymbol, promoCode])
}
