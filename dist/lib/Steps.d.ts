import type { PropsWithChildren, ReactNode } from 'react';
export declare function Steps({ children, className }: PropsWithChildren<{
    className?: string;
}>): import("react/jsx-runtime").JSX.Element;
export declare function Step({ index, title, children }: PropsWithChildren<{
    index: number;
    title: ReactNode;
}>): import("react/jsx-runtime").JSX.Element;
