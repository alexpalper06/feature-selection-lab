import React from 'react';
import type {LucideIcon} from 'lucide-react';
import Spinner from './Spinner';

const VARIANTS = {
    primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98]',
    secondary: 'bg-accent-bg text-accent border border-accent-border hover:bg-accent/10',
    ghost: 'text-text-main hover:bg-accent-bg hover:text-accent',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white',
} as const;

const SIZES = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
    md: 'h-9 px-4 text-sm gap-2 rounded-lg',
    lg: 'h-11 px-6 text-base gap-2.5 rounded-lg',
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof VARIANTS;
    size?: keyof typeof SIZES;
    loading?: boolean;
    icon?: LucideIcon | React.ElementType;
}

export default function Button({
                                   children,
                                   variant = 'primary',
                                   size = 'md',
                                   loading = false,
                                   disabled = false,
                                   icon: Icon,
                                   className = '',
                                   ...props
                               }: ButtonProps): React.ReactElement {
    const isDisabled = disabled || loading;
    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

    return (
        <button
            disabled={isDisabled}
            className={[
                'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none',
                VARIANTS[variant],
                SIZES[size],
                isDisabled ? 'opacity-50 cursor-not-allowed' : '',
                className,
            ].join(' ')}
            {...props}
        >
            {loading && <Spinner size="sm" className="mr-1"/>}
            {!loading && Icon && <Icon className={iconSize}/>}
            {children}
        </button>
    );
}