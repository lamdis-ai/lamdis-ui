import { jsx as _jsx } from "react/jsx-runtime";
export function Logo({ src = '/lamdis_white.webp', width = 128, alt = 'Lamdis logo', className = '', ...rest }) {
    return _jsx("img", { src: src, width: width, alt: alt, className: className, ...rest });
}
