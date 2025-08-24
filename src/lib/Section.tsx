import type { PropsWithChildren, ReactNode } from 'react';

type SectionProps = PropsWithChildren<{
  id?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
  className?: string;
  gradient?: boolean; // subtle per-section highlight to align with content
  divider?: boolean;  // thin top divider to clarify separation
}>;

export function Section({ id, title, subtitle, center = true, className = '', gradient = true, divider = true, children }: SectionProps) {
  const titleCls = [
    'mb-3',
    center ? 'text-center' : '',
    'text-[clamp(20px,3.5vw,28px)]',
    'font-bold',
    'tracking-tight',
  ].join(' ');
  const wrapCls = [
    'relative overflow-hidden',
    'py-14 md:py-20',
    divider ? 'border-t border-stroke/40' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <section id={id} className={wrapCls}>
      {gradient ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(700px 450px at 50% 0%, rgba(140,123,255,.12), transparent 70%)',
          }}
        />
      ) : null}
      {(title || subtitle) ? (
        <div className="max-w-5xl mx-auto px-4">
          {title ? <h2 className={titleCls}>{title}</h2> : null}
          {subtitle ? (
            <p className={[center ? 'text-center' : '', 'sub max-w-3xl mx-auto mb-6'].join(' ')}>{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
