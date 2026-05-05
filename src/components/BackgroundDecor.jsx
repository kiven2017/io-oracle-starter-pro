export default function BackgroundDecor({ scrollY }) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-[-12%] right-[-6%] h-[52%] w-[52%] rounded-full bg-cyan-900/10 blur-[120px]"
        style={{ transform: `translate3d(0, ${scrollY * 0.08}px, 0)` }}
      />
      <div
        className="absolute bottom-[-10%] left-[-8%] h-[42%] w-[42%] rounded-full bg-blue-900/10 blur-[120px]"
        style={{ transform: `translate3d(0, ${-scrollY * 0.06}px, 0)` }}
      />
      <div className="absolute inset-0 opacity-20 grid-pattern" />
    </div>
  )
}
