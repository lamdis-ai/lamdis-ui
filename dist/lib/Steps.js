import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Steps({ children, className = '' }) {
    return _jsx("div", { className: ["max-w-5xl mx-auto px-4 grid gap-4", className].join(' '), children: children });
}
export function Step({ index, title, children }) {
    return (_jsx("div", { className: "card p-4", children: _jsxs("div", { className: "grid gap-4", style: { gridTemplateColumns: '40px 1fr' }, children: [_jsx("div", { className: "w-10 h-10 rounded-xl grid place-items-center border border-stroke/60 text-sm font-semibold", style: { background: 'linear-gradient(135deg,rgba(140,123,255,.25),rgba(74,208,255,.25))' }, children: index }), _jsxs("div", { children: [_jsx("div", { className: "text-[15px] font-semibold", children: title }), _jsx("div", { className: "text-[14px] leading-6 text-[#c9d2ea] mt-1", children: children })] })] }) }));
}
