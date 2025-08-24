import { jsx as _jsx } from "react/jsx-runtime";
export function Card(props) {
    return _jsx("div", { className: ["card p-4 md:p-5", props.className].filter(Boolean).join(" "), children: props.children });
}
export function SectionTitle({ children }) {
    return _jsx("h2", { className: "text-[clamp(18px,3vw,24px)] font-semibold tracking-tight mb-3", children: children });
}
