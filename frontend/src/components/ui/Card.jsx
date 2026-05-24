import React from 'react';

export default function Card({ 
  children, 
  hoverable = true, 
  className = '',
  ...props 
}) {
  return (
    <div
      className={`
        bg-surface dark:bg-surface-dark
        border border-border dark:border-border-dark
        rounded-lg shadow-card
        transition-all duration-300
        ${hoverable ? 'hover:shadow-hover dark:hover:shadow-hover hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
