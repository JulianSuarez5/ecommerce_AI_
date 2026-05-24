import React from 'react';

export default function Modal({ 
  open = false, 
  onClose, 
  title, 
  children,
  size = 'md',
  ...props 
}) {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`
          bg-surface dark:bg-surface-dark
          rounded-xl shadow-modal
          w-full ${sizes[size]}
          max-h-[90vh] overflow-y-auto
          animate-scale-in
        `}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div className="p-6 border-b border-border dark:border-border-dark sticky top-0 bg-surface dark:bg-surface-dark">
            <h2 className="text-lg font-bold text-ink dark:text-ink-dark">{title}</h2>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
