import React from 'react';

const COLORS = {
    blue: 'bg-accent-bg text-accent border-accent-border',
    gray: 'bg-code-bg text-text-main border-border-main',
    green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
} as const;

export interface BadgeProps {
    children: React.ReactNode;
    color?: keyof typeof COLORS;
    className?: string;
}

export default function Badge({
                                  children,
                                  color = 'blue',
                                  className = ''
                              }: BadgeProps): React.ReactElement {
    return (
        <span
            className={[
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border',
                COLORS[color],
                className,
            ].join(' ')}
        >
      {children}
    </span>
    );
}