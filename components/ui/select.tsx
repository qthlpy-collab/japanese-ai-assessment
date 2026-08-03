import * as React from 'react';
import { cn } from '@/lib/utils';

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#b9d3c9]',
        className
      )}
      {...props}
    />
  );
}
