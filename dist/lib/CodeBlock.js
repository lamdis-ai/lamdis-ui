import { jsx as _jsx } from "react/jsx-runtime";
export function CodeBlock({ code, language = 'text', className = '' }) {
    return (_jsx("pre", { className: [
            'bg-[#0e1220] border border-[#1b2136] rounded-xl p-3 md:p-4 overflow-auto',
            'text-[13px] md:text-[14px] leading-[1.55] text-[#e8f3ff]',
            className,
        ].join(' '), children: _jsx("code", { "data-language": language, children: code }) }));
}
