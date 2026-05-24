import React from 'react';

export default function Input({
  label,
  error,
  disabled = false,
  icon: Icon,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-ink dark:text-ink-dark">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-ink-tertiary pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-surface border border-border
            text-ink placeholder-ink-tertiary
            transition-all duration-150
            focus:border-accent-500 focus:shadow-[0_0_0_3px_rgba(232,184,109,0.1)]
            dark:bg-surface-dark dark:border-border-dark dark:text-ink-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
}
