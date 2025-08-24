import { jsx as _jsx } from "react/jsx-runtime";
export function CTAGroup({ children, className = '' }) {
    return _jsx("div", { className: ["flex flex-wrap items-center justify-center gap-3", className].join(' '), children: children });
}
export function StickyBar({ children }) {
    return (_jsx("div", { className: "fixed bottom-3 inset-x-0 px-3", children: _jsx("div", { className: "mx-auto max-w-3xl rounded-xl border border-stroke/60 bg-card/90 backdrop-blur p-3 flex items-center justify-center gap-3", children: children }) }));
}
