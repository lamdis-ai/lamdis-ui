import type { PropsWithChildren, ReactNode } from 'react';

export function Conversation({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={[
      'grid gap-3',
      className,
    ].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function Turn({ who, children, color }: { who: ReactNode; children: ReactNode; color?: 'blue' | string }) {
  const isBlue = color === 'blue';
  const whoCls = [
    'shrink-0 inline-flex items-center px-2 py-1 rounded-md text-[11px] border',
    isBlue ? 'border-sky-400/40 bg-sky-400/10 text-sky-200' : 'border-stroke/60 bg-card/70',
  ].join(' ');
  const cardCls = [
    'card p-3 md:p-4',
    isBlue ? 'ring-1 ring-inset ring-sky-400/30 border-sky-400/40 bg-[radial-gradient(800px_200px_at_0%_-30%,rgba(56,189,248,.08),transparent_60%)]' : '',
  ].join(' ');
  return (
    <div className="grid grid-cols-[auto,1fr] items-start gap-3">
      <div className={whoCls}>
        {who}
      </div>
      <div className={cardCls}>
        <div className="text-[14px] leading-6 text-[#c9d2ea]">
          {children}
        </div>
      </div>
    </div>
  );
}
