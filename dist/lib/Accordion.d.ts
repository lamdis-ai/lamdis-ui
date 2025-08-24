import type { PropsWithChildren, ReactNode } from 'react';
export declare function Accordion({ children, defaultOpen, className }: PropsWithChildren<{
    defaultOpen?: number | null;
    className?: string;
}>): import("react/jsx-runtime").JSX.Element;
export declare function AccordionItem({ title, children, index, open, onToggle, }: PropsWithChildren<{
    title: ReactNode;
    index?: number;
    open?: boolean;
    onToggle?: () => void;
}>): import("react/jsx-runtime").JSX.Element;
