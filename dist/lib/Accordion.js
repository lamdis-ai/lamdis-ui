"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, Children, isValidElement, cloneElement } from 'react';
export function Accordion({ children, defaultOpen = 0, className = '' }) {
    const [openIndex, setOpenIndex] = useState(defaultOpen);
    const items = Children.toArray(children).filter(Boolean);
    return (_jsx("div", { className: ["divide-y divide-stroke/40 rounded-xl border border-stroke/60 bg-card/60 backdrop-blur", className].join(' '), children: items.map((child, idx) => {
            if (!isValidElement(child))
                return child;
            return cloneElement(child, {
                index: idx,
                open: openIndex === idx,
                onToggle: () => setOpenIndex(openIndex === idx ? null : idx)
            });
        }) }));
}
export function AccordionItem({ title, children, index, open, onToggle, }) {
    return (_jsxs("div", { children: [_jsxs("button", { type: "button", onClick: onToggle, className: "w-full flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-4", "aria-expanded": open, "aria-controls": `acc-panel-${index}`, children: [_jsx("span", { className: "text-left text-[15px] md:text-[16px] font-medium text-[#dbe3ff]", children: title }), _jsx("span", { className: ["transition-transform", open ? "rotate-180" : "rotate-0"].join(' '), "aria-hidden": true, children: "\u25BE" })] }), _jsx("div", { id: `acc-panel-${index}`, role: "region", hidden: !open, className: "px-4 pb-4 md:px-5 md:pb-5", children: open ? (_jsx("div", { className: "card", children: children })) : null })] }));
}
