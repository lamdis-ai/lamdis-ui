import type { PropsWithChildren, ReactNode } from 'react';

export function Hero({ kicker, title, subtitle, className = '', children }: PropsWithChildren<{ kicker?: ReactNode; title: ReactNode; subtitle?: ReactNode; className?: string }>) {
  return (
    <header className={["max-w-6xl mx-auto px-4 pt-12 pb-10 text-center", className].join(' ')}>
      {kicker ? <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[11px] border border-stroke/60 bg-card/70 backdrop-blur mb-4">{kicker}</div> : null}
      <h1 className="text-balance text-[clamp(26px,6.5vw,56px)] leading-[1.08] font-extrabold tracking-tight">{title}</h1>
      {subtitle ? <p className="sub text-balance text-[clamp(14px,2.4vw,19px)] max-w-3xl mx-auto mt-4">{subtitle}</p> : null}
      {children ? <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div> : null}
    </header>
  );
}
