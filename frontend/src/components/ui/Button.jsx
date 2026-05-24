import React from 'react';
import { Plus, X } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'bg-ink text-surface hover:opacity-90 dark:bg-surface dark:text-ink',
    secondary: 'bg-surface-tertiary text-ink hover:bg-surface-tertiary/80 dark:bg-surface-tertiary/20',
    outline: 'border border-border text-ink hover:bg-surface-tertiary dark:border-border',
    accent: 'bg-accent-500 text-white hover:bg-accent-600',
    ghost: 'text-ink-secondary hover:bg-surface-tertiary dark:hover:bg-surface-tertiary/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4 py-2.5 text-sm font-semibold gap-2',
    lg: 'px-6 py-3 text-base font-semibold gap-2',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-150 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {Icon && !loading && <Icon size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
}
