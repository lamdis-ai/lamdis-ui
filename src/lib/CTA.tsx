import type { PropsWithChildren } from 'react';

export function CTAGroup({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <div className={["flex flex-wrap items-center justify-center gap-3", className].join(' ')}>{children}</div>;
}

export function StickyBar({ children }: PropsWithChildren) {
  return (
    <div className="fixed bottom-3 inset-x-0 px-3">
      <div className="mx-auto max-w-3xl rounded-xl border border-stroke/60 bg-card/90 backdrop-blur p-3 flex items-center justify-center gap-3">
        {children}
      </div>
    </div>
  );
}
