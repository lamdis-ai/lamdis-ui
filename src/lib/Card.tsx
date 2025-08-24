import type { PropsWithChildren, ReactNode } from 'react';

type CardProps = PropsWithChildren<{
  className?: string;
  // Optional collapsible behavior (accordion-like)
  collapsible?: boolean;
  // Initial open state when collapsible
  defaultOpen?: boolean;
  // Optional title/header content to show in the summary row
  title?: ReactNode;
  // Optional right-aligned header actions/content
  right?: ReactNode;
}>;

export function Card({ className, children, collapsible, defaultOpen, title, right }: CardProps) {
  const cls = ["card p-4 md:p-5", className].filter(Boolean).join(" ");
  if (!collapsible) {
    return <div className={cls}>{children}</div>;
  }
  // Native disclosure element -> no client JS required
  return (
    <details className={[cls, "group"].join(" ")} {...(defaultOpen ? { open: true } : {})}>
      <summary className="cursor-pointer list-none -mx-1 px-1 flex items-center justify-between gap-3 select-none">
        <span className="text-[15px] md:text-[16px] font-medium">{title ?? "Details"}</span>
        <span className="transition-transform group-open:rotate-180" aria-hidden>▾</span>
      </summary>
      {right ? (
        <div className="mt-2 -mt-6 mb-4 flex items-center justify-end">{right}</div>
      ) : null}
      <div className="mt-3">{children}</div>
    </details>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[clamp(18px,3vw,24px)] font-semibold tracking-tight mb-3">{children}</h2>;
}
