import { ReactNode } from 'react';

interface ButtonProps {
  className?: string;
  variant?: 'outline';
  children: ReactNode;
  onClick?: () => void;
}

export function Button({ className, variant, children, onClick }: ButtonProps) {
  const variantStyles = variant === 'outline' ? 'border border-gray-300 text-gray-700 hover:bg-gray-100' : '';
  return (
    <button
      className={`px-4 py-2 rounded-lg transition-colors ${variantStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}