import type { PropsWithChildren, ReactNode } from 'react';
export declare function Conversation({ children, className }: PropsWithChildren<{
    className?: string;
}>): import("react/jsx-runtime").JSX.Element;
export declare function Turn({ who, children, color }: {
    who: ReactNode;
    children: ReactNode;
    color?: 'blue' | string;
}): import("react/jsx-runtime").JSX.Element;
