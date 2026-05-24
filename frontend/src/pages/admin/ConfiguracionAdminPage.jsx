import { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';
import { configService } from '../../services/configService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ConfiguracionAdminPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    configService.get()
      .then(setConfig)
      .catch(() => toast.error('Error al cargar configuración'))
      .finally(() => setLoading(false));
  }, []);

  const setField = (field) => (e) => setConfig((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await configService.update(config);
      toast.success('Configuración guardada');
    } catch { toast.error('Error al guardar'); }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl" style={{ background: 'var(--accent)', opacity: 0.15, border: '1px solid var(--accent)' }}>
          <Settings size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Configuración del negocio</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Esta información se usa para que la IA responda preguntas sobre la tienda</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Métodos de pago y contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Métodos de pago aceptados</label>
              <input value={config?.metodosPago || ''} onChange={setField('metodosPago')} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} placeholder="TARJETA, PAYPAL, TRANSFERENCIA" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Teléfono de contacto</label>
              <input value={config?.telefonoContacto || ''} onChange={setField('telefonoContacto')} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email de contacto</label>
              <input value={config?.emailContacto || ''} onChange={setField('emailContacto')} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Dirección de la tienda</label>
              <input value={config?.direccionTienda || ''} onChange={setField('direccionTienda')} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Políticas</h2>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Políticas de envío</label>
            <textarea value={config?.politicasEnvio || ''} onChange={setField('politicasEnvio')} rows={3} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-y" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Políticas de devolución</label>
            <textarea value={config?.politicasDevolucion || ''} onChange={setField('politicasDevolucion')} rows={3} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-y" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Horarios y adicional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Horario de atención</label>
              <input value={config?.horarioAtencion || ''} onChange={setField('horarioAtencion')} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} placeholder="Lun-Vie: 8AM-6PM" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Días de entrega estimados</label>
              <input value={config?.diasEntrega || ''} onChange={setField('diasEntrega')} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} placeholder="3-5 días hábiles" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Información adicional</label>
            <textarea value={config?.infoAdicional || ''} onChange={setField('infoAdicional')} rows={3} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-y" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {saving ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-text)', borderTopColor: 'transparent' }} /> : <Save size={16} />}
            Guardar configuración
          </button>
        </div>
      </form>
    </div>
  );
}
