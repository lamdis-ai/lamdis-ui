import React from 'react';
type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
};
export declare const Switch: React.FC<Props>;
export {};
