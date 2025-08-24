import type { PropsWithChildren, ReactNode } from 'react';
type SectionProps = PropsWithChildren<{
    id?: string;
    title?: ReactNode;
    subtitle?: ReactNode;
    center?: boolean;
    className?: string;
    gradient?: boolean;
    divider?: boolean;
}>;
export declare function Section({ id, title, subtitle, center, className, gradient, divider, children }: SectionProps): import("react/jsx-runtime").JSX.Element;
export {};
