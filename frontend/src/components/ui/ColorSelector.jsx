const COLORS = [
  { name: 'Negro', value: '#111111' },
  { name: 'Blanco', value: '#f5f5f5' },
  { name: 'Rojo', value: '#dc2626' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Gris', value: '#6b7280' },
  { name: 'Beige', value: '#d4a574' },
  { name: 'Marrón', value: '#8B4513' },
];

export default function ColorSelector({ selected, onSelect, colors = COLORS }) {
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {colors.map((c) => (
          <button
            key={c.value}
            onClick={() => onSelect?.(c)}
            className={`w-8 h-8 rounded-full transition-all duration-200 ${
              selected?.value === c.value
                ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-surface scale-110'
                : 'hover:scale-110'
            }`}
            style={{ backgroundColor: c.value, border: '2px solid rgba(255,255,255,0.15)' }}
            title={c.name}
          />
        ))}
      </div>
      {selected && (
        <p className="text-xs text-ink-tertiary mt-2">
          Color seleccionado: <span className="text-ink font-medium">{selected.name}</span>
        </p>
      )}
    </div>
  );
}
