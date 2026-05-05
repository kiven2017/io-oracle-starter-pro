import { X } from 'lucide-react'
import Modal from './Modal'
import { useLocale } from '../context/LocaleContext'

export default function PriceTableModal({ open, onClose, priceStages }) {
  const { content, formatText } = useLocale()

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2.2rem] border border-cyan-400/14 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.1),transparent_34%),linear-gradient(180deg,rgba(9,15,30,0.98),rgba(6,11,22,0.97))] p-6 font-heading brand-italic shadow-[0_30px_120px_rgba(0,0,0,0.52)] no-scrollbar sm:rounded-[3rem] sm:p-8 lg:rounded-[4rem] lg:p-12"
    >
      <div className="space-y-8 sm:space-y-10">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black uppercase tracking-tighter sm:text-3xl lg:text-4xl">{content.priceTable.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition-colors hover:text-white"
            aria-label={content.priceTable.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {content.priceTable.intro}
          </p>
          <div className="grid grid-cols-3 gap-6 border-b border-white/5 pb-6 text-xs font-black uppercase text-slate-400">
            <span>{content.priceTable.stage}</span>
            <span>{content.priceTable.price}</span>
            <span>{content.priceTable.status}</span>
          </div>
          <div className="space-y-4 text-xs font-sans">
            {priceStages.map((stage) => {
              const isActive = stage.status === 'ACTIVE'
              const isFinal = stage.status === 'FINAL'
              const isCompleted = stage.status === 'COMPLETED'
              const stageNumber = stage.label.replace(/\D+/g, '')
              const localizedStatus =
                stage.status === 'ACTIVE'
                  ? content.priceTable.active
                  : stage.status === 'COMPLETED'
                    ? content.priceTable.completed
                    : stage.status === 'FINAL'
                      ? content.priceTable.final
                      : content.priceTable.upcoming

              return (
                <div
                  key={stage.label}
                  className={`flex justify-between rounded-2xl border p-3 ${
                    isActive
                      ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-400'
                      : isCompleted
                        ? 'border-emerald-400/10 bg-emerald-400/5 text-emerald-300'
                      : isFinal
                        ? 'border-white/5 text-slate-700'
                      : 'border-white/5 text-slate-500'
                  }`}
                >
                  <span>{formatText(content.priceTable.stageLabel, { number: stageNumber })}</span>
                  <span>{stage.price}</span>
                  <span className="font-black">{localizedStatus}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}
