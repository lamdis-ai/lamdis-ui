import type { PropsWithChildren } from 'react';

export function Badge({ children }: PropsWithChildren) {
  return <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-stroke/60 bg-card">{children}</span>;
}
