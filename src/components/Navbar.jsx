import { Menu, X } from 'lucide-react'
import PaymentBrandIcon from './PaymentBrandIcon'
import LanguageSwitcher from './LanguageSwitcher'
import { useLocale } from '../context/LocaleContext'

function WalletStatusButton({ connectedWalletInfo, onClick, mobile = false }) {
  const { content } = useLocale()

  if (!connectedWalletInfo?.label) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          mobile
            ? 'mt-2 min-h-[3.6rem] w-full rounded-[1.35rem] bg-cyan-500 px-6 py-4 text-[0.96rem] font-black uppercase tracking-[0.06em] text-black'
            : 'rounded-full bg-cyan-500 px-7 py-3 font-extrabold tracking-tighter text-black shadow-lg transition-all hover:bg-cyan-400 active:scale-95'
        }
      >
        {mobile ? content.hero.joinPresale : content.hero.joinPresale}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        mobile
          ? 'mt-2 flex min-h-[3.6rem] w-full items-center justify-center gap-3 rounded-[1.35rem] bg-cyan-500 px-6 py-4 text-[0.96rem] font-black text-black'
          : 'flex items-center gap-3 rounded-full bg-cyan-500 px-5 py-3 font-extrabold tracking-tighter text-black shadow-lg transition-all hover:bg-cyan-400 active:scale-95'
      }
      title={connectedWalletInfo.providerName || connectedWalletInfo.label}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/12">
        <PaymentBrandIcon brand={connectedWalletInfo.brand} className="h-5 w-5" />
      </span>
      <span>{connectedWalletInfo.label}</span>
    </button>
  )
}

export default function Navbar({
  navItems,
  activeSection,
  isScrolled,
  isMobileMenuOpen,
  connectedWalletInfo,
  onToggleMobileMenu,
  onNavigate,
  onJoinPresale,
}) {
  return (
    <nav
      id="navbar"
      className={`fixed top-0 z-50 w-full px-4 transition-all duration-500 ${
        isScrolled
          ? 'border-b border-white/5 bg-[#020617]/90 py-3 backdrop-blur-xl'
          : 'border-b border-white/5 bg-[#020617]/72 py-4 backdrop-blur-lg'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-1 sm:px-2">
        <button
          type="button"
          className="flex items-center gap-4 text-left"
          onClick={() => onNavigate('#hero')}
        >
          <img
            src="/logo.png"
            alt="AIOracle"
            className="h-10 w-10 shrink-0 drop-shadow-[0_10px_26px_rgba(77,125,255,0.35)] sm:h-11 sm:w-11"
          />
          <div className="flex min-w-0 flex-col">
            <span className="font-heading brand-italic text-lg font-bold leading-none tracking-tighter uppercase sm:text-xl">
              AIOracle
            </span>
            <span className="brand-italic text-[9px] font-bold uppercase tracking-[0.34em] text-cyan-500 sm:text-[10px] sm:tracking-[0.4em]">
              Physical Truth
            </span>
          </div>
        </button>

        <div className="hidden items-center gap-6 text-[13px] font-bold uppercase tracking-[0.18em] text-slate-400 xl:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              className={`nav-link transition-colors hover:text-cyan-400 ${
                activeSection === item.id ? 'is-active' : ''
              }`}
              onClick={() => onNavigate(item.href)}
            >
              {item.label}
            </button>
          ))}
          <LanguageSwitcher compact />
          <div className="mx-1 h-4 w-px bg-white/10" />
          <WalletStatusButton connectedWalletInfo={connectedWalletInfo} onClick={onJoinPresale} />
        </div>

        <button
          type="button"
          className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 xl:hidden"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={onToggleMobileMenu}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`mx-auto mt-4 max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#020617]/95 px-5 backdrop-blur-xl transition-all duration-300 xl:hidden ${
          isMobileMenuOpen
            ? 'pointer-events-auto max-h-[520px] py-6 opacity-100'
            : 'pointer-events-none max-h-0 py-0 opacity-0'
        }`}
      >
        <div className="space-y-4">
          <LanguageSwitcher mobile />
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => onNavigate(item.href)}
              className={`block w-full border-b border-white/5 pb-4 text-left text-[15px] font-bold uppercase tracking-[0.24em] transition-colors ${
                activeSection === item.id ? 'text-cyan-400' : 'text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
          <WalletStatusButton connectedWalletInfo={connectedWalletInfo} onClick={onJoinPresale} mobile />
        </div>
      </div>
    </nav>
  )
}
