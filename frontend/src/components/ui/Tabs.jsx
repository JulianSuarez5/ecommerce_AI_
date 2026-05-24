import React from 'react';

export default function Tabs({ 
  tabs = [], 
  defaultTab = 0,
  onChange,
  className = '',
}) {
  const [active, setActive] = React.useState(defaultTab);

  const handleChange = (idx) => {
    setActive(idx);
    onChange?.(idx);
  };

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-border dark:border-border-dark bg-surface-tertiary dark:bg-surface-tertiary/20 p-1 rounded-t-lg overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => handleChange(idx)}
            className={`
              px-4 py-2.5 text-sm font-semibold rounded-lg whitespace-nowrap
              transition-all duration-200
              ${active === idx
                ? 'bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark shadow-subtle'
                : 'text-ink-secondary hover:text-ink'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6 bg-surface dark:bg-surface-dark border border-t-0 border-border dark:border-border-dark rounded-b-lg">
        {tabs[active]?.content}
      </div>
    </div>
  );
}
