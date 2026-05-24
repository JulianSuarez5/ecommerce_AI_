import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  error,
  options = [],
  placeholder = 'Selecciona...',
  disabled = false,
  className = '',
  ...props
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-ink dark:text-ink-dark">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-surface border border-border
            text-ink appearance-none
            transition-all duration-150
            focus:border-accent-500 focus:shadow-[0_0_0_3px_rgba(232,184,109,0.1)]
            dark:bg-surface-dark dark:border-border-dark dark:text-ink-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none"
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
}
