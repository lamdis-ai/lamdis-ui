import React, { PropsWithChildren } from 'react'

// Generic table components for consistent styling.
export function TableWrapper({ children }: PropsWithChildren) {
  return <div className="overflow-auto w-full">{children}</div>
}

export function Table({ children }: PropsWithChildren) {
  return <table className="w-full text-sm border-collapse">{children}</table>
}

export function THead({ children }: PropsWithChildren) {
  return <thead className="text-left text-muted">{children}</thead>
}

export function TRow({ children, className = '' }: PropsWithChildren & { className?: string }) {
  return <tr className={className}>{children}</tr>
}

interface CellBaseProps extends PropsWithChildren {
  className?: string
  colSpan?: number
  rowSpan?: number
  [key: string]: any // allow future html attrs without retyping
}
type THProps = CellBaseProps
type TDProps = CellBaseProps

export function TH({ children, className = '', ...rest }: THProps) {
  return <th className={`py-2 pr-3 font-medium ${className}`} {...rest}>{children}</th>
}

export function TD({ children, className = '', ...rest }: TDProps) {
  return <td className={`py-1 pr-3 align-top ${className}`} {...rest}>{children}</td>
}
