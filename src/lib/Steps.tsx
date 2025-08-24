import type { PropsWithChildren, ReactNode } from 'react';

export function Steps({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <div className={["max-w-5xl mx-auto px-4 grid gap-4", className].join(' ')}>{children}</div>;
}

export function Step({ index, title, children }: PropsWithChildren<{ index: number; title: ReactNode }>) {
  return (
    <div className="card p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: '40px 1fr' }}>
        <div className="w-10 h-10 rounded-xl grid place-items-center border border-stroke/60 text-sm font-semibold" style={{ background: 'linear-gradient(135deg,rgba(140,123,255,.25),rgba(74,208,255,.25))' }}>
          {index}
        </div>
        <div>
          <div className="text-[15px] font-semibold">{title}</div>
          <div className="text-[14px] leading-6 text-[#c9d2ea] mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
