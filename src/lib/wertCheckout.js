import WertWidget from '@wert-io/widget-initializer'
import { postBackend } from './backendApi'

const DEFAULT_BRAND_COLOR = '#22d3ee'

const PAYMENT_METHOD_MAP = {
  mastercard: 'card',
  visa: 'card',
  card: 'card',
  applepay: 'apple-pay',
  'apple-pay': 'apple-pay',
  gpay: 'google-pay',
  'google-pay': 'google-pay',
}

function createClickId() {
  const generator = globalThis.crypto?.randomUUID
  if (typeof generator === 'function') {
    return generator.call(globalThis.crypto)
  }

  return `wert-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

function mapPaymentMethodId(paymentMethodId) {
  return PAYMENT_METHOD_MAP[paymentMethodId] ?? 'card'
}

export async function startWertCheckout({
  amountUsd,
  networkId,
  tokenSymbol,
  paymentMethodId,
  promoCode,
  customer,
  beneficiaryAddress,
  directReferrerAddress,
  indirectReferrerAddress,
  listeners = {},
}) {
  const clickId = createClickId()
  const payload = networkId === 'solana'
    ? await postBackend('/api/wert/solana/checkout', {
      amount_usd: Number(amountUsd),
      network_id: networkId,
      token_symbol: tokenSymbol,
      payment_method_id: paymentMethodId,
      promo_code: promoCode,
      click_id: clickId,
      customer,
      beneficiary_address: beneficiaryAddress,
      direct_referrer_address: directReferrerAddress,
      indirect_referrer_address: indirectReferrerAddress,
    }, 'Unable to start Wert checkout. Check backend credentials and network settings.')
    : await postBackend('/api/wert/session', {
      amount_usd: Number(amountUsd),
      network_id: networkId,
      token_symbol: tokenSymbol,
      payment_method_id: paymentMethodId,
      promo_code: promoCode,
      click_id: clickId,
      customer,
    }, 'Unable to start Wert checkout. Check backend credentials and network settings.')

  if (!payload?.partner_id) {
    throw new Error('Wert checkout creation succeeded, but the backend response is missing partner data.')
  }

  const widgetOptions = {
    partner_id: payload.partner_id,
    origin: payload.widget_origin,
    click_id: payload.click_id ?? clickId,
    payment_method: payload.payment_method ?? mapPaymentMethodId(paymentMethodId),
    payment_method_restriction: true,
    theme: 'dark',
    brand_color: payload.brand_color ?? DEFAULT_BRAND_COLOR,
    lang: payload.lang ?? 'en',
    redirect_url: payload.redirect_url,
    support_url: payload.support_url,
    extra: payload.extra,
    listeners: {
      close: () => {
        listeners.onClose?.(payload)
      },
      error: (detail) => {
        listeners.onError?.(detail)
      },
      'payment-status': (detail) => {
        listeners.onPaymentStatus?.(detail, payload)
      },
    },
  }

  if (payload.session_id) {
    widgetOptions.session_id = payload.session_id
  } else if (payload.sc_address && payload.sc_input_data && payload.signature) {
    widgetOptions.address = payload.address
    widgetOptions.commodity = payload.commodity
    widgetOptions.commodity_amount = payload.commodity_amount
    widgetOptions.network = payload.network
    widgetOptions.sc_address = payload.sc_address
    widgetOptions.sc_input_data = payload.sc_input_data
    widgetOptions.signature = payload.signature
    widgetOptions.email = payload.email
    widgetOptions.full_name = payload.full_name
    widgetOptions.phone = payload.phone
    widgetOptions.country_of_residence = payload.country_of_residence
    widgetOptions.state_of_residence = payload.state_of_residence
    widgetOptions.date_of_birth = payload.date_of_birth
    widgetOptions.card_country_code = payload.card_country_code
    widgetOptions.card_city = payload.card_city
    widgetOptions.card_state_code = payload.card_state_code
    widgetOptions.card_post_code = payload.card_post_code
    widgetOptions.card_street = payload.card_street
  } else {
    throw new Error('Wert checkout creation succeeded, but the backend response is missing checkout payload.')
  }

  const widget = new WertWidget(widgetOptions)

  widget.open()

  return {
    widget,
    session: payload,
  }
}
