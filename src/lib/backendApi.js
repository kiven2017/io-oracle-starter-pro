const DEFAULT_BACKEND_BASE_URL = 'https://www.tds-hub.com'

function getErrorMessage(payload, fallbackMessage) {
  if (payload instanceof Error && payload.message) {
    return payload.message
  }

  if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
    return payload.error
  }

  return fallbackMessage
}

export function getBackendBaseUrl() {
  const configured = import.meta.env.VITE_WERT_BACKEND_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  return DEFAULT_BACKEND_BASE_URL
}

async function parseResponse(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function postBackend(path, body, fallbackMessage = 'Backend request failed.') {
  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, fallbackMessage))
  }

  return payload
}

export async function getBackend(path, params = {}, fallbackMessage = 'Backend request failed.') {
  const url = new URL(`${getBackendBaseUrl()}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') {
      return
    }

    url.searchParams.set(key, String(value))
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, fallbackMessage))
  }

  return payload
}
