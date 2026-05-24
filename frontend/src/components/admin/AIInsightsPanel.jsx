import { useState, useEffect } from 'react';
import { Sparkles, Send, Brain, TrendingUp, Package, Users, AlertTriangle, X, Info } from 'lucide-react';
import { aiService } from '../../services/aiService';

const QUICK_QUESTIONS = [
  'Que productos debo restockear esta semana?',
  'Cual es mi categoria mas rentable?',
  'Como van las ventas vs el mes pasado?',
  'Que productos tienen mas resenas positivas?',
];

const INSIGHT_ICONS = {
  danger: AlertTriangle,
  warning: AlertTriangle,
  positive: TrendingUp,
  info: Info,
};

const INSIGHT_COLORS = {
  danger: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  positive: 'text-emerald-600 dark:text-emerald-400',
  info: 'text-teal-600 dark:text-teal-400',
};

const DEFAULT_INSIGHTS = [
  { tipo: 'positive', titulo: 'Ventas del mes', descripcion: 'Las ventas de electronica han aumentado 18% este mes. Considera aumentar inventario.' },
  { tipo: 'danger', titulo: 'Alerta de stock', descripcion: '3 productos estan por debajo del stock minimo. Laptop Pro 15" necesita reposicion urgente.' },
  { tipo: 'warning', titulo: 'Pedidos pendientes', descripcion: 'Hay 5 pedidos pendientes de confirmacion. Revisa la seccion de pedidos.' },
  { tipo: 'info', titulo: 'Categoria lider', descripcion: 'Electronica es la categoria con mayores ventas del mes.' },
];

export default function AIInsightsPanel({ metricas }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [insights, setInsights] = useState(DEFAULT_INSIGHTS);
  const [dismissedInsights, setDismissedInsights] = useState(new Set());

  useEffect(() => {
    aiService.getInsights().then((data) => {
      if (data.insights) setInsights(data.insights);
    }).catch(() => {});
  }, []);

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || chatLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setChatLoading(true);

    try {
      const { response } = await aiService.adminChat(msg);
      setMessages((prev) => [...prev, { role: 'assistant', content: response || 'Lo siento, no pude procesar tu pregunta.' }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Hubo un error al conectar con el asistente. Por favor intenta de nuevo.',
      }]);
    }
    setChatLoading(false);
  };

  const dismissInsight = (idx) => {
    const newSet = new Set(dismissedInsights);
    newSet.add(idx);
    setDismissedInsights(newSet);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-lg border border-teal-500/20 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain size={20} className="text-teal-500" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">AI Insights</h2>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Gemini
          </span>
        </div>
        <button
          onClick={() => setShowChat(!showChat)}
          className={`text-xs font-medium transition-colors ${showChat ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
        >
          {showChat ? 'Ver insights' : 'Chat IA'}
        </button>
      </div>

      {showChat ? (
        <div className="flex flex-col" style={{ height: '400px' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles size={32} className="mx-auto text-teal-500 mb-2" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Preguntale a la IA sobre tu negocio</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Datos en tiempo real del dashboard</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                  m.role === 'user'
                    ? 'bg-teal-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_QUESTIONS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} className="text-[11px] px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} type="text" placeholder="Pregunta sobre tu negocio..." className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-teal-500 transition-colors" />
              <button onClick={() => sendMessage()} disabled={chatLoading || !input.trim()} className="px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors disabled:opacity-50">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((card, i) => {
            if (dismissedInsights.has(i)) return null;
            const Icon = INSIGHT_ICONS[card.tipo] || Info;
            const color = INSIGHT_COLORS[card.tipo] || 'text-teal-500';
            return (
              <div key={i} className="relative bg-white dark:bg-zinc-900/60 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 group">
                <button onClick={() => dismissInsight(i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                  <X size={14} />
                </button>
                <Icon size={18} className={`${color} mb-2`} />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">{card.titulo}</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{card.descripcion}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
