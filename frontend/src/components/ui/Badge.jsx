import React from 'react';
import { X } from 'lucide-react';

export default function Badge({ 
  children, 
  variant = 'neutral',
  removable = false,
  onRemove,
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'bg-primary-light text-primary dark:bg-primary/10',
    accent: 'bg-accent-500/10 text-accent-500',
    success: 'bg-green-500/10 text-green-600',
    error: 'bg-red-500/10 text-red-600',
    warning: 'bg-yellow-500/10 text-yellow-600',
    neutral: 'bg-surface-tertiary text-ink-secondary dark:bg-surface-tertiary/20',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2
        px-3 py-1 rounded-full
        text-xs font-semibold
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label="Remover"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
