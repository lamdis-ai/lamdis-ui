import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Field({ label, hint, children }) {
    return (_jsxs("label", { className: "grid gap-1", children: [_jsx("span", { className: "label", children: label }), children, hint ? _jsx("span", { className: "text-xs text-muted", children: hint }) : null] }));
}
