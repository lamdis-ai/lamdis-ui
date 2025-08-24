import { jsx as _jsx } from "react/jsx-runtime";
export function Input(props) {
    const { className = '', ...rest } = props;
    return _jsx("input", { className: ["input", className].join(' '), ...rest });
}
export function Textarea(props) {
    const { className = '', ...rest } = props;
    return _jsx("textarea", { className: ["input", className].join(' '), ...rest });
}
export function Select(props) {
    const { className = '', ...rest } = props;
    return _jsx("select", { className: ["input", className].join(' '), ...rest });
}
