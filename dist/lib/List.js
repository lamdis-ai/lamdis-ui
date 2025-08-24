import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Bullets({ children, className = '' }) {
    return _jsx("ul", { className: ["grid gap-2.5 md:gap-3", className].join(' '), children: children });
}
export function Bullet({ children }) {
    return (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx("span", { className: "mt-[7px] inline-block w-1.5 h-1.5 rounded-full bg-brand flex-none", "aria-hidden": true }), _jsx("span", { className: "text-[15px] leading-6 text-[#c9d2ea]", children: children })] }));
}
