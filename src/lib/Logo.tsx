import type { HTMLAttributes } from 'react';

export type LogoProps = {
  src?: string;
  width?: number;
  alt?: string;
} & Omit<HTMLAttributes<HTMLImageElement>, 'children'>;

export function Logo({ src = '/lamdis_white.webp', width = 128, alt = 'Lamdis logo', className = '', ...rest }: LogoProps) {
  return <img src={src} width={width} alt={alt} className={className} {...rest} />;
}
