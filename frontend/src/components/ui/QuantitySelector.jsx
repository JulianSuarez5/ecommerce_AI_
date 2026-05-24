import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ value = 1, onChange, min = 1, max = 99 }) {
  const dec = () => onChange?.(Math.max(min, value - 1));
  const inc = () => onChange?.(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
      <button
        onClick={dec}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-tertiary transition-colors disabled:opacity-30"
      >
        <Minus size={16} />
      </button>
      <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-ink border-x border-border">
        {value}
      </span>
      <button
        onClick={inc}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface-tertiary transition-colors disabled:opacity-30"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
