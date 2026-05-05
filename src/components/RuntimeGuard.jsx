import { Component } from 'react'
import { getFlowText } from '../data/flowText'

const LOCALE_STORAGE_KEY = 'aioracle-locale'
const RUNTIME_RECOVERY_FLAG = 'aioracle-runtime-recovery-attempted'

function resolveLocale() {
  if (typeof window === 'undefined') {
    return 'en'
  }

  return window.localStorage.getItem(LOCALE_STORAGE_KEY) || 'en'
}

function formatRuntimeError(error) {
  const text = getFlowText(resolveLocale()).runtime
  if (!error) {
    return text.unknown
  }

  if (typeof error === 'string') {
    return error
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim()
  }

  return String(error)
}

function shouldIgnoreRuntimeError(message) {
  if (!message) {
    return false
  }

  const normalized = String(message).trim().toLowerCase()

  return (
    normalized === 'origin not allowed' ||
    normalized.includes('downprogcallback is not defined') ||
    normalized.includes('func sseerror not found') ||
    (normalized.includes('no matching key') && normalized.includes('session topic')) ||
    (normalized.includes('undefined is not an object') && normalized.includes('getprovider') && normalized.includes('request')) ||
    normalized.includes("cannot read properties of undefined (reading 'request')")
  )
}

function getSafeHomeUrl() {
  if (typeof window === 'undefined') {
    return '/'
  }

  const url = new URL(window.location.href)
  const transientParams = [
    'wallet_callback',
    'wallet_mode',
    'wallet_flow',
    'wallet_action',
    'wallet_entry',
    'wallet_cluster',
    'wallet_network',
    'phantom_encryption_public_key',
    'solflare_encryption_public_key',
    'nonce',
    'data',
    'errorCode',
    'errorMessage',
  ]

  transientParams.forEach((param) => {
    url.searchParams.delete(param)
  })

  return `${url.pathname}${url.search}${url.hash}`
}

export default class RuntimeGuard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      renderError: null,
      asyncError: null,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      renderError: formatRuntimeError(error),
    }
  }

  componentDidCatch(error) {
    if (typeof window === 'undefined') {
      return
    }

    const nextMessage = formatRuntimeError(error)
    console.error('Recovered render error and returning to homepage.', nextMessage)

    const hasRetried = window.sessionStorage.getItem(RUNTIME_RECOVERY_FLAG) === '1'
    if (hasRetried) {
      window.setTimeout(() => {
        window.location.replace('/')
      }, 0)
      return
    }

    window.sessionStorage.setItem(RUNTIME_RECOVERY_FLAG, '1')
    window.setTimeout(() => {
      window.location.replace(getSafeHomeUrl())
    }, 0)
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      this.recoveryCleanupTimeout = window.setTimeout(() => {
        window.sessionStorage.removeItem(RUNTIME_RECOVERY_FLAG)
        this.recoveryCleanupTimeout = null
      }, 5000)
    }

    this.handleWindowError = (event) => {
      const message = formatRuntimeError(event.error || event.message)
      const source = String(event.filename || '')
      const isExtensionSource =
        source.startsWith('chrome-extension://') ||
        source.startsWith('moz-extension://') ||
        source.startsWith('safari-web-extension://')

      if (shouldIgnoreRuntimeError(message) || isExtensionSource) {
        return
      }

      console.warn('Ignored browser-side runtime error to preserve the homepage experience.', message)
    }

    this.handleUnhandledRejection = (event) => {
      const message = formatRuntimeError(event.reason)
      const stack = String(event.reason?.stack || '')
      const isExtensionSource =
        stack.includes('chrome-extension://') ||
        stack.includes('moz-extension://') ||
        stack.includes('safari-web-extension://')

      if (shouldIgnoreRuntimeError(message) || isExtensionSource) {
        return
      }

      console.warn('Ignored browser-side promise rejection to preserve the homepage experience.', message)
    }

    window.addEventListener('error', this.handleWindowError)
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  componentWillUnmount() {
    if (this.recoveryCleanupTimeout) {
      window.clearTimeout(this.recoveryCleanupTimeout)
      this.recoveryCleanupTimeout = null
    }

    window.removeEventListener('error', this.handleWindowError)
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  render() {
    const { renderError } = this.state

    if (!renderError) {
      return this.props.children
    }

    return null
  }
}
