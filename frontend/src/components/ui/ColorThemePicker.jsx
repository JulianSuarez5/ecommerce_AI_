import { useEffect, useState, useRef } from 'react';
import { Palette } from 'lucide-react';
import { applyTheme, clearTheme, generateTheme, isLight } from '../../utils/colorTheme';

const PRESETS = [
  { name: 'Negro', bg: '#080808' },
  { name: 'Noche', bg: '#0c0a09' },
  { name: 'Grafito', bg: '#18181b' },
  { name: 'Pizarra', bg: '#1e293b' },
  { name: 'Azul profundo', bg: '#0f172a' },
  { name: 'Oscuro teal', bg: '#0f2027' },
  { name: 'Azul marino', bg: '#0a1628' },
  { name: 'Verde selva', bg: '#1a3a2a' },
  { name: 'Verde musgo', bg: '#1a2e1a' },
  { name: 'Morado oscuro', bg: '#2d1b3d' },
  { name: 'Púrpura real', bg: '#2e1065' },
  { name: 'Vino tinto', bg: '#2d1b1b' },
  { name: 'Teal vibrante', bg: '#134e4a' },
  { name: 'Azul oscuro', bg: '#1a1a4a' },
  { name: 'Rosa oscuro', bg: '#2a0a2a' },
  { name: 'Verde oscuro', bg: '#1a2a0a' },
  { name: 'Acero', bg: '#e2e8f0' },
  { name: 'Gris claro', bg: '#f4f7f6' },
  { name: 'Marfil', bg: '#faf5f0' },
  { name: 'Lavanda', bg: '#f0e6f6' },
  { name: 'Azul cielo', bg: '#dbeafe' },
  { name: 'Rosa pastel', bg: '#fce7f3' },
  { name: 'Verde menta', bg: '#d1fae5' },
  { name: 'Naranja coral', bg: '#ffedd5' },
  { name: 'Rosa claro', bg: '#ffe0f0' },
  { name: 'Blanco', bg: '#ffffff' },
];

function ColorPreview({ bgColor }) {
  const theme = generateTheme(bgColor);
  const light = isLight(bgColor);

  return (
    <div
      className="rounded-lg p-2.5 mt-3 border transition-colors duration-300"
      style={{
        backgroundColor: theme['--bg-surface'],
        borderColor: light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)',
      }}
    >
      <p className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: theme['--text-tertiary'] }}>
        Vista previa
      </p>
      <p className="text-xs font-medium mb-2" style={{ color: theme['--text-primary'] }}>
        Texto principal
      </p>
      <p className="text-[11px] mb-2" style={{ color: theme['--text-secondary'] }}>
        Texto secundario con buena legibilidad
      </p>
      <div className="flex gap-2">
        <span
          className="px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors"
          style={{
            backgroundColor: theme['--accent'],
            color: theme['--accent-text'],
          }}
        >
          Botón
        </span>
        <span
          className="px-2.5 py-1 rounded-md text-[10px] font-medium border"
          style={{
            borderColor: light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)',
            color: theme['--text-secondary'],
          }}
        >
          Secundario
        </span>
      </div>
    </div>
  );
}

export default function ColorThemePicker() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem('centrova-bg-color') || ''; }
    catch { return ''; }
  });
  const [customHex, setCustomHex] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (selected) {
      applyTheme(selected);
    }
  }, [selected]);

  function handlePreset(preset) {
    setSelected(preset.bg);
    setCustomHex('');
    setOpen(false);
  }

  function handleCustom(e) {
    const val = e.target.value;
    setCustomHex(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setSelected(val);
      setOpen(false);
    }
  }

  function handleReset() {
    setSelected('');
    setCustomHex('');
    clearTheme();
    setOpen(false);
  }

  const currentColor = selected || '#f4f7f6';

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Cambiar color de fondo"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl transition-all duration-200"
        style={{ color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
        title="Personalizar color de fondo"
      >
        <Palette size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-xl shadow-xl z-50 max-h-[80vh] overflow-y-auto"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Color de fondo
          </p>

          <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>Oscuros</p>
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {PRESETS.filter(p => !isLight(p.bg)).slice(0, 16).map((p) => (
              <button
                key={p.bg}
                onClick={() => handlePreset(p)}
                title={p.name}
                className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: p.bg,
                  borderColor: selected === p.bg ? 'var(--accent)' : 'var(--border-color)',
                  ...(selected === p.bg ? { transform: 'scale(1.1)', boxShadow: '0 0 0 2px var(--accent)' } : {}),
                }}
              />
            ))}
          </div>

          <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>Claros</p>
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {PRESETS.filter(p => isLight(p.bg)).map((p) => (
              <button
                key={p.bg}
                onClick={() => handlePreset(p)}
                title={p.name}
                className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: p.bg,
                  borderColor: selected === p.bg ? 'var(--accent)' : 'var(--border-color)',
                  ...(selected === p.bg ? { transform: 'scale(1.1)', boxShadow: '0 0 0 2px var(--accent)' } : {}),
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <label className="relative cursor-pointer">
              <div
                className="w-10 h-10 rounded-lg border-2 shadow-sm"
                style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(customHex) ? customHex : currentColor, borderColor: 'var(--border-color)' }}
              />
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(customHex) ? customHex : '#14b8a6'}
                onChange={handleCustom}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
            <input
              type="text"
              value={customHex}
              onChange={handleCustom}
              placeholder="#14b8a6"
              maxLength={7}
              className="flex-1 px-3 py-1.5 rounded-lg border text-xs font-mono focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
          </div>

          {selected && (
            <>
              <ColorPreview bgColor={selected} />
              <button
                onClick={handleReset}
                className="mt-2 w-full text-xs transition-colors py-1.5"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                Restaurar color por defecto
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
