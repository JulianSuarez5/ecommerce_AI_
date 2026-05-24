import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items = [] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
          <button
            onClick={() => setOpen(open === idx ? -1 : idx)}
            className={`
              w-full flex items-center justify-between p-4
              text-left font-semibold text-ink dark:text-ink-dark
              bg-surface-tertiary dark:bg-surface-tertiary/20
              hover:bg-surface-tertiary/80 transition-colors
            `}
          >
            {item.label}
            <ChevronDown 
              size={16}
              className={`transition-transform ${open === idx ? 'rotate-180' : ''}`}
            />
          </button>
          {open === idx && (
            <div className="p-4 bg-surface dark:bg-surface-dark border-t border-border dark:border-border-dark text-ink-secondary dark:text-ink-dark-secondary">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
