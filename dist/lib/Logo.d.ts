import type { HTMLAttributes } from 'react';
export type LogoProps = {
    src?: string;
    width?: number;
    alt?: string;
} & Omit<HTMLAttributes<HTMLImageElement>, 'children'>;
export declare function Logo({ src, width, alt, className, ...rest }: LogoProps): import("react/jsx-runtime").JSX.Element;
