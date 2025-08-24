import type { PropsWithChildren } from 'react';

export function Bullets({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <ul className={["grid gap-2.5 md:gap-3", className].join(' ')}>{children}</ul>;
}

export function Bullet({ children }: PropsWithChildren) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-[7px] inline-block w-1.5 h-1.5 rounded-full bg-brand flex-none" aria-hidden />
      <span className="text-[15px] leading-6 text-[#c9d2ea]">{children}</span>
    </li>
  );
}
