import { ReactNode } from 'react';

interface BadgeProps {
  className?: string;
  variant?: 'secondary';
  children: ReactNode;
}

export function Badge({ className, variant, children }: BadgeProps) {
  const variantStyles = variant === 'secondary' ? 'bg-gray-100 text-gray-700' : '';
  return (
    <span className={`px-3 py-1 text-sm rounded-full ${variantStyles} ${className}`}>
      {children}
    </span>
  );
}