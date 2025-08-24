import type { PropsWithChildren, ReactNode } from 'react';

export function Kicker({ children, className='' }: PropsWithChildren<{ className?: string }>) {
  return <div className={["inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[11px] border border-stroke/60 bg-card/70 backdrop-blur", className].join(' ')}>{children}</div>;
}

export function Title({ children, className='' }: PropsWithChildren<{ className?: string }>) {
  return <h1 className={["text-balance text-[clamp(26px,6.5vw,56px)] leading-[1.08] font-extrabold tracking-tight", className].join(' ')}>{children}</h1>;
}

export function Subtitle({ children, className='' }: PropsWithChildren<{ className?: string }>) {
  return <p className={["sub text-balance text-[clamp(14px,2.4vw,19px)] max-w-3xl mx-auto", className].join(' ')}>{children}</p>;
}

export function Lead({ children, className='' }: PropsWithChildren<{ className?: string }>) {
  return <p className={["text-[clamp(16px,2.8vw,22px)] leading-snug text-muted", className].join(' ')}>{children}</p>;
}
