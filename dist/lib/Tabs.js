"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function Tabs({ tabs, defaultTabId, className = '', onChange }) {
    var _a, _b;
    const initial = defaultTabId || ((_b = (_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '');
    const [active, setActive] = useState(initial);
    function set(id) {
        setActive(id);
        onChange === null || onChange === void 0 ? void 0 : onChange(id);
    }
    return (_jsxs("div", { className: className, children: [_jsx("div", { className: "border-b flex gap-2", children: tabs.map(t => (_jsx("button", { className: [
                        'px-3 py-2 text-sm -mb-px border-b-2',
                        active === t.id ? 'border-brand text-brand font-medium' : 'border-transparent text-muted hover:text-foreground'
                    ].join(' '), onClick: () => set(t.id), type: "button", children: t.label }, t.id))) }), _jsx("div", { className: "pt-3", children: tabs.map(t => (_jsx("div", { style: { display: active === t.id ? 'block' : 'none' }, children: t.content }, t.id))) })] }));
}
