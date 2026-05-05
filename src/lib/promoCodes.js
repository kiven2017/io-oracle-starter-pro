const PROMO_CODE_RULES = Object.freeze({
  SVIP10: Object.freeze({
    id: 1,
    code: 'SVIP10',
    minimumUsd: 1000,
    bonusPercent: 5,
  }),
  SVIP20: Object.freeze({
    id: 2,
    code: 'SVIP20',
    minimumUsd: 2000,
    bonusPercent: 10,
  }),
  SVIP50: Object.freeze({
    id: 3,
    code: 'SVIP50',
    minimumUsd: 5000,
    bonusPercent: 15,
  }),
  SSVIP200: Object.freeze({
    id: 4,
    code: 'SSVIP200',
    minimumUsd: 20000,
    bonusPercent: 25,
  }),
})

const VALID_PROMO_CODES = Object.freeze(Object.keys(PROMO_CODE_RULES))
const PROMO_ID_RULES = Object.freeze(
  Object.values(PROMO_CODE_RULES).reduce((accumulator, rule) => {
    accumulator[rule.id] = rule
    return accumulator
  }, {}),
)

export function normalizePromoCode(value) {
  return String(value || '').trim().toUpperCase()
}

export function getPromoCodeRule(promoCode) {
  const normalized = normalizePromoCode(promoCode)
  return PROMO_CODE_RULES[normalized] ?? null
}

export function getPromoCodeRuleById(promoId) {
  return PROMO_ID_RULES[Number(promoId)] ?? null
}

export function getPromoCodeId(promoCode) {
  return getPromoCodeRule(promoCode)?.id ?? 0
}

export function evaluatePromoCode({ promoCode, usdEquivalent, baseEstimatedAio }) {
  const normalizedPromoCode = normalizePromoCode(promoCode)

  if (!normalizedPromoCode) {
    return {
      promoId: 0,
      promoCode: '',
      rule: null,
      status: 'none',
      bonusPercent: 0,
      bonusAio: 0,
      estimatedAio: baseEstimatedAio,
      validCodes: VALID_PROMO_CODES,
    }
  }

  const rule = getPromoCodeRule(normalizedPromoCode)
  if (!rule) {
    return {
      promoId: 0,
      promoCode: normalizedPromoCode,
      rule: null,
      status: 'invalid_code',
      bonusPercent: 0,
      bonusAio: 0,
      estimatedAio: baseEstimatedAio,
      validCodes: VALID_PROMO_CODES,
    }
  }

  if (Number(usdEquivalent) < rule.minimumUsd) {
    return {
      promoId: rule.id,
      promoCode: normalizedPromoCode,
      rule,
      status: 'below_threshold',
      bonusPercent: 0,
      bonusAio: 0,
      estimatedAio: baseEstimatedAio,
      validCodes: VALID_PROMO_CODES,
    }
  }

  const bonusAio = Math.floor(Number(baseEstimatedAio || 0) * (rule.bonusPercent / 100))

  return {
    promoId: rule.id,
    promoCode: normalizedPromoCode,
    rule,
    status: 'applied',
    bonusPercent: rule.bonusPercent,
    bonusAio,
    estimatedAio: Number(baseEstimatedAio || 0) + bonusAio,
    validCodes: VALID_PROMO_CODES,
  }
}

export function getPromoCodeMessage({ locale, status, promoCode, rule, validCodes, numberFormatter }) {
  const isZh = String(locale || '').toLowerCase().startsWith('zh')
  const formattedMinimum = rule?.minimumUsd ? `${numberFormatter.format(rule.minimumUsd)} USDT` : ''

  if (status === 'invalid_code') {
    return isZh
      ? `優惠碼無效。請使用 ${validCodes.join('、')}。`
      : `Invalid promo code. Use ${validCodes.join(', ')}.`
  }

  if (status === 'below_threshold' && rule) {
    return isZh
      ? `${promoCode} 需要至少 ${formattedMinimum} 的購買金額。`
      : `${promoCode} requires a minimum purchase of ${formattedMinimum}.`
  }

  if (status === 'applied' && rule) {
    return isZh
      ? `${promoCode} 已套用，AIO 額外增加 ${rule.bonusPercent}%。`
      : `${promoCode} applied. Your AIO allocation gets an extra ${rule.bonusPercent}% bonus.`
  }

  return ''
}

export { PROMO_CODE_RULES, PROMO_ID_RULES, VALID_PROMO_CODES }
