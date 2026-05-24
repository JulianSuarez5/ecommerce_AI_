import React from 'react';

export default function EmptyState({ 
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 p-3 bg-accent-500/10 rounded-xl text-accent-500">
          <Icon size={40} />
        </div>
      )}
      {title && (
        <h3 className="text-lg font-bold text-ink dark:text-ink-dark mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary mb-6 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="flex gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
