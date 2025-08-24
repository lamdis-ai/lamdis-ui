import React, { PropsWithChildren } from 'react'

export type DecisionStatus = 'ALLOW' | 'ALLOW_WITH_CONDITIONS' | 'BLOCKED' | 'NEEDS_INPUT' | string

function classes(status: DecisionStatus) {
  switch (status) {
    case 'ALLOW':
      return 'bg-emerald-500/15 text-emerald-500'
    case 'ALLOW_WITH_CONDITIONS':
      return 'bg-amber-500/15 text-amber-600'
    case 'NEEDS_INPUT':
      return 'bg-indigo-500/15 text-indigo-500'
    case 'BLOCKED':
      return 'bg-red-500/15 text-red-500'
    default:
      return 'bg-muted/30 text-muted-foreground'
  }
}

export function StatusBadge({ status, children }: PropsWithChildren<{ status: DecisionStatus }>) {
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${classes(status)}`}>{children || status}</span>
}
