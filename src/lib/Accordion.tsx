"use client";
import { useState, Children, isValidElement, cloneElement } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

export function Accordion({ children, defaultOpen = 0, className = '' }: PropsWithChildren<{ defaultOpen?: number | null; className?: string }>) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const items = Children.toArray(children).filter(Boolean);
  return (
    <div className={["divide-y divide-stroke/40 rounded-xl border border-stroke/60 bg-card/60 backdrop-blur", className].join(' ')}>
      {items.map((child, idx) => {
        if (!isValidElement(child)) return child as any;
        return cloneElement(child as any, {
          index: idx,
          open: openIndex === idx,
          onToggle: () => setOpenIndex(openIndex === idx ? null : idx)
        });
      })}
    </div>
  );
}

export function AccordionItem({
  title,
  children,
  index,
  open,
  onToggle,
}: PropsWithChildren<{ title: ReactNode; index?: number; open?: boolean; onToggle?: () => void; }>) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-4"
        aria-expanded={open}
        aria-controls={`acc-panel-${index}`}
      >
        <span className="text-left text-[15px] md:text-[16px] font-medium text-[#dbe3ff]">{title}</span>
        <span className={["transition-transform", open ? "rotate-180" : "rotate-0"].join(' ')} aria-hidden>▾</span>
      </button>
      <div id={`acc-panel-${index}`} role="region" hidden={!open} className="px-4 pb-4 md:px-5 md:pb-5">
        {open ? (
          <div className="card">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
