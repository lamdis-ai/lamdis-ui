import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'primary' | 'ghost';
};
export declare function Button({ className, variant, ...rest }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: 'default' | 'primary' | 'ghost';
};
export declare function ButtonLink({ className, variant, ...rest }: ButtonLinkProps): import("react/jsx-runtime").JSX.Element;
