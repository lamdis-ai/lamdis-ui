import { jsx as _jsx } from "react/jsx-runtime";
export function Button({ className = '', variant = 'default', ...rest }) {
    const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 border border-stroke/60 bg-card text-[14px] font-medium hover:border-stroke transition';
    const variants = {
        default: '',
        primary: 'bg-brand text-white hover:opacity-95 border-transparent',
        ghost: 'bg-transparent hover:bg-card/60',
    };
    return _jsx("button", { className: [base, variants[variant], className].join(' '), ...rest });
}
export function ButtonLink({ className = '', variant = 'default', ...rest }) {
    const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 border border-stroke/60 bg-card text-[14px] font-medium hover:border-stroke transition';
    const variants = {
        default: '',
        primary: 'bg-brand text-white hover:opacity-95 border-transparent',
        ghost: 'bg-transparent hover:bg-card/60',
    };
    return _jsx("a", { className: [base, variants[variant], className].join(' '), ...rest });
}
