import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'ghost' };
export function Button({ className = '', variant = 'default', ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 border border-stroke/60 bg-card text-[14px] font-medium hover:border-stroke transition';
  const variants: Record<string,string> = {
    default: '',
    primary: 'bg-brand text-white hover:opacity-95 border-transparent',
    ghost: 'bg-transparent hover:bg-card/60',
  };
  return <button className={[base, variants[variant], className].join(' ')} {...rest} />;
}

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: 'default' | 'primary' | 'ghost' };
export function ButtonLink({ className = '', variant = 'default', ...rest }: ButtonLinkProps) {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 border border-stroke/60 bg-card text-[14px] font-medium hover:border-stroke transition';
  const variants: Record<string,string> = {
    default: '',
    primary: 'bg-brand text-white hover:opacity-95 border-transparent',
    ghost: 'bg-transparent hover:bg-card/60',
  };
  return <a className={[base, variants[variant], className].join(' ')} {...rest} />;
}
