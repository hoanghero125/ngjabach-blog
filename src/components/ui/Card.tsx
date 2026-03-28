import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={`bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }: CardProps) {
  return <div className={className}>{children}</div>;
}
