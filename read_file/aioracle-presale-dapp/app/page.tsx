import { Hero } from '@/components/hero';
import { PresaleConsole } from '@/components/presale-console';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-slate-200">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-20 right-[-10%] h-[42rem] w-[42rem] rounded-full bg-cyan-900/10 blur-[140px]" />
        <div className="absolute bottom-[-12rem] left-[-8%] h-[32rem] w-[32rem] rounded-full bg-blue-900/10 blur-[140px]" />
      </div>
      <Hero />
      <section className="relative z-10 px-6 pb-24">
        <div className="mx-auto max-w-7xl lg:ml-auto lg:w-[48%]">
          <PresaleConsole />
        </div>
      </section>
    </main>
  );
}
