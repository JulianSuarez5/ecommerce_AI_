import React from 'react';

export default function Skeleton({ 
  count = 1, 
  height = 'h-4',
  width = 'w-full',
  className = '',
  circle = false,
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`
            bg-surface-tertiary dark:bg-surface-tertiary/20
            animate-pulse rounded
            ${circle ? 'rounded-full' : ''}
            ${height} ${width}
            ${className}
            ${count > 1 ? 'mb-3' : ''}
          `}
        />
      ))}
    </>
  );
}
