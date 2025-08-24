import type { ReactNode } from 'react';
export type TabItem = {
    id: string;
    label: string;
    content: ReactNode;
};
export declare function Tabs({ tabs, defaultTabId, className, onChange }: {
    tabs: TabItem[];
    defaultTabId?: string;
    className?: string;
    onChange?: (id: string) => void;
}): import("react/jsx-runtime").JSX.Element;
