import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Section({ id, title, subtitle, center = true, className = '', gradient = true, divider = true, children }) {
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
    return (_jsxs("section", { id: id, className: wrapCls, children: [gradient ? (_jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 -z-10", style: {
                    background: 'radial-gradient(700px 450px at 50% 0%, rgba(140,123,255,.12), transparent 70%)',
                } })) : null, (title || subtitle) ? (_jsxs("div", { className: "max-w-5xl mx-auto px-4", children: [title ? _jsx("h2", { className: titleCls, children: title }) : null, subtitle ? (_jsx("p", { className: [center ? 'text-center' : '', 'sub max-w-3xl mx-auto mb-6'].join(' '), children: subtitle })) : null] })) : null, children] }));
}
