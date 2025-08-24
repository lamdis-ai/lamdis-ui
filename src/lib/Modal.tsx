import type { ReactNode, HTMLAttributes } from 'react';
import { Button } from './Button';

export type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
} & HTMLAttributes<HTMLDivElement>;

export function Modal({ open, onClose, title, children, footer, widthClass = 'max-w-lg', className = '', ...rest }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-8 overflow-y-auto">
      <div className="fixed inset-0 bg-bg/70 backdrop-blur-sm" onClick={onClose} />
      <div className={["relative w-full", widthClass, "bg-card border border-stroke/60 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4", className].join(' ')} {...rest}>
        <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-stroke/60">
          <h3 className="text-[15px] font-semibold tracking-tight leading-none">{title}</h3>
          {onClose ? <Button variant="ghost" onClick={onClose} aria-label="Close">✕</Button> : null}
        </div>
        <div className="px-5 py-4 space-y-4 text-sm leading-relaxed">
          {children}
        </div>
        {footer ? (
          <div className="px-5 py-3 border-t border-stroke/60 bg-muted/10 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:items-center justify-end rounded-b-xl">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
