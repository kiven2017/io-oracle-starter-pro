import { getBackend } from './backendApi'

function toFiniteNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export async function fetchPresaleLiveStatus() {
  const payload = await getBackend('/api/presale/live-status', {}, 'Unable to load presale live status.')

  return {
    countdownEndAt: String(payload?.countdown_end_at || payload?.countdownEndAt || '').trim() || null,
    progressPercent: toFiniteNumber(payload?.progress_percent ?? payload?.progressPercent),
    remainingAio: toFiniteNumber(payload?.remaining_aio ?? payload?.remainingAio),
    auditLinks: Array.isArray(payload?.audit_links ?? payload?.auditLinks) ? (payload?.audit_links ?? payload?.auditLinks) : null,
  }
}
