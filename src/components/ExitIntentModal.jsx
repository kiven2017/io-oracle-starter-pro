import { Check, Rocket } from 'lucide-react'
import Modal from './Modal'
import { useLocale } from '../context/LocaleContext'

export default function ExitIntentModal({ open, onClose }) {
  const { content } = useLocale()

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-full max-w-md rounded-[2.2rem] border border-cyan-400/18 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),transparent_36%),linear-gradient(180deg,rgba(9,15,30,0.98),rgba(6,11,22,0.97))] p-6 text-center font-heading shadow-[0_30px_120px_rgba(0,0,0,0.52)] sm:rounded-[3.2rem] sm:p-10"
    >
      <div className="space-y-8 sm:space-y-10">
        <div className="mx-auto flex h-24 w-24 animate-bounce items-center justify-center rounded-[2.5rem] border border-cyan-400/12 bg-cyan-400/12 text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
          <Rocket className="h-12 w-12" />
        </div>
        <div className="space-y-6">
          <h3 className="brand-italic text-3xl font-black uppercase text-white">{content.exitIntent.title}</h3>
          <p className="text-sm font-light uppercase tracking-wider text-slate-300">
            {content.exitIntent.description}
          </p>
          <ul className="mx-auto max-w-[220px] space-y-3 text-left text-[11px] font-bold uppercase tracking-tighter text-slate-200">
            <li className="brand-italic flex items-center gap-3">
              <Check className="h-4 w-4 text-cyan-400" />
              {content.exitIntent.pointA}
            </li>
            <li className="brand-italic flex items-center gap-3">
              <Check className="h-4 w-4 text-cyan-400" />
              {content.exitIntent.pointB}
            </li>
          </ul>
        </div>
        <div className="space-y-5">
          <a
            href="https://t.me/AIOracle_Official"
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-3xl bg-cyan-500 py-5 font-black uppercase tracking-widest text-black shadow-[0_18px_60px_rgba(34,211,238,0.18)] transition-colors hover:bg-cyan-400"
          >
            {content.exitIntent.joinTelegram}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 underline decoration-white/10 transition-colors hover:text-white"
          >
            {content.exitIntent.close}
          </button>
        </div>
      </div>
    </Modal>
  )
}
