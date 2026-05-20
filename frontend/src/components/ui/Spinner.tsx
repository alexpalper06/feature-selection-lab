// src/components/ui/Spinner.tsx
import React from 'react';

const SIZES = { 
  sm: 'w-4 h-4', 
  md: 'w-5 h-5', 
  lg: 'w-8 h-8' 
} as const;

export interface SpinnerProps {
  size?: keyof typeof SIZES;
  className?: string;
}

export default function Spinner({ 
  size = 'md', 
  className = '' 
}: SpinnerProps): React.ReactElement {
  return (
    <svg
      className={`animate-spin ${SIZES[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}