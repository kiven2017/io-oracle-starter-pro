import { CheckCircle2, LoaderCircle, X } from 'lucide-react'
import Modal from './Modal'
import { useLocale } from '../context/LocaleContext'
import { getFlowText } from '../data/flowText'

export default function PurchaseFollowupModal({
  open,
  onClose,
  onConfirm,
  checking = false,
  statusMessage = '',
}) {
  const { locale } = useLocale()
  const text = getFlowText(locale).confirmPurchase

  return (
    <Modal
      open={open}
      onClose={checking ? () => {} : onClose}
      className="w-full max-w-2xl rounded-[2.2rem] border border-cyan-400/18 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),transparent_42%),linear-gradient(180deg,rgba(10,16,31,0.98),rgba(6,10,20,0.98))] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.52)] sm:rounded-[2.6rem] sm:p-7 md:p-9"
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-400">{text.reviewPurchase}</p>
            <h3 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-white">
              {text.handoffTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={checking}
            aria-label={text.handoffClose}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-[1.9rem] border border-cyan-400/14 bg-cyan-400/8 p-5 text-sm leading-7 text-slate-100">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[#07111d] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
            <CheckCircle2 className="h-4 w-4" />
            AIOracle
          </div>
          <p>{text.handoffDescription}</p>
        </div>

        <div className={`rounded-[1.4rem] border px-4 py-3 text-sm ${
          checking
            ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
            : 'border-white/10 bg-white/5 text-slate-200'
        }`}>
          {statusMessage || (checking ? text.handoffChecking : text.handoffPending)}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            disabled={checking}
            className="min-h-[3.5rem] rounded-[1.25rem] border border-white/12 bg-white/5 px-5 py-4 text-[0.92rem] font-bold uppercase tracking-[0.06em] text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-[1.3rem] sm:text-sm sm:tracking-[0.12em]"
          >
            {text.handoffClose}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={checking}
            className="flex min-h-[3.5rem] items-center justify-center gap-3 rounded-[1.25rem] bg-white px-5 py-4 text-[0.92rem] font-black uppercase tracking-[0.06em] text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-[1.3rem] sm:text-sm sm:tracking-[0.12em]"
          >
            {checking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {checking ? text.handoffChecking : text.handoffPrimary}
          </button>
        </div>
      </div>
    </Modal>
  )
}
