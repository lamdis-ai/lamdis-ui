"use client";
import type { ReactNode } from 'react';
import { useState } from 'react';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export function Tabs({ tabs, defaultTabId, className = '', onChange }: {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
  onChange?: (id: string) => void;
}) {
  const initial = defaultTabId || (tabs[0]?.id ?? '');
  const [active, setActive] = useState(initial);
  function set(id: string) {
    setActive(id);
    onChange?.(id);
  }
  return (
    <div className={className}>
      <div className="border-b flex gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            className={[
              'px-3 py-2 text-sm -mb-px border-b-2',
              active === t.id ? 'border-brand text-brand font-medium' : 'border-transparent text-muted hover:text-foreground'
            ].join(' ')}
            onClick={() => set(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-3">
        {tabs.map(t => (
          <div key={t.id} style={{ display: active === t.id ? 'block' : 'none' }}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
