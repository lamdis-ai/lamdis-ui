import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Switch = ({ checked, onChange, label, disabled, className }) => {
    return (_jsxs("label", { className: `inline-flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className || ''}`, children: [label && _jsx("span", { className: "text-sm text-gray-700", children: label }), _jsx("span", { role: "switch", "aria-checked": checked, tabIndex: 0, onClick: () => !disabled && onChange(!checked), onKeyDown: (e) => {
                    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onChange(!checked);
                    }
                }, className: `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`, children: _jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}` }) })] }));
};
