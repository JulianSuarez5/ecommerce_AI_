import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';

const SUGGESTIONS = [
  '¿Qué productos tienen en oferta?',
  '¿Cómo funciona el envío?',
  '¿Tienen vista 3D de los productos?',
  'Recomiéndame algo para mi setup',
];

export default function AIChatModal() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientContext, setClientContext] = useState('');
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !clientContext) {
      setSuggestionsDismissed(false);
      Promise.all([
        aiService.getClientContext().catch(() => ({ contexto: '' })),
        aiService.getBusinessInfo().catch(() => ({ info: '' })),
      ]).then(([clientRes, infoRes]) => {
        const combined = `${clientRes.contexto || ''}\n\n${infoRes.info || ''}`;
        if (combined.trim()) setClientContext(combined);
      });
    }
  }, [open, clientContext]);

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setSuggestionsDismissed(true);
    setLoading(true);

    try {
      const data = await aiService.chat(msg, clientContext || '');
      const reply = data.response || 'Lo siento, no pude procesar tu pregunta.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Hubo un error al conectar con el asistente. Por favor intenta de nuevo.',
      }]);
    }
    setLoading(false);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[390px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border shadow-2xl sm:right-6"
          style={{
            height: '560px',
            maxHeight: 'calc(100vh - 150px)',
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex shrink-0 items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center gap-2">
              <img
                src="https://cdn.prod.website-files.com/6501f1891917bde75ab542ee/653e8be9ae6bc59344b62ff3_robot-phunk%201.webp"
                alt="Bender"
                className="h-8 w-8 rounded-full object-cover"
                style={{ border: '2px solid var(--accent)' }}
              />
              <div>
                <span className="text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>Bender — Asistente IA</span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: '#10b981' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} /> Disponible
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
              className="grid h-10 w-10 place-items-center rounded-full transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !suggestionsDismissed && (
              <div className="text-center py-4">
                <Sparkles size={28} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Hola! Soy Bender</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Tu asistente de CENTROVA. Pregúntame lo que necesites</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {SUGGESTIONS.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)} disabled={loading}
                      className="rounded-full border px-3 py-1.5 text-[11px] transition-colors disabled:opacity-50"
                      style={{
                        borderColor: 'var(--border-color)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-secondary)',
                      }}
                      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSuggestionsDismissed(true)}
                  className="mt-3 text-[10px] transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                >
                  Escribir mi propia pregunta ↓
                </button>
              </div>
            )}

            {messages.length === 0 && suggestionsDismissed && (
              <div className="text-center py-6">
                <Sparkles size={28} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>¿En qué puedo ayudarte?</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed"
                  style={{
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: m.role === 'user' ? 'var(--accent-text)' : 'var(--text-primary)',
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-3" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)', animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)', animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="shrink-0 border-t p-4"
            style={{
              borderColor: 'var(--border-color)',
              background: 'var(--bg-secondary)',
            }}
          >
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                type="text" placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border outline-none transition-colors"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
                disabled={loading} />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                className="px-3 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
                onMouseEnter={(e) => { if (!loading && input.trim()) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        style={{ background: 'var(--accent)' }}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
