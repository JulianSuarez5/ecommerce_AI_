import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <div className="w-full min-h-[80vh] flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 gap-12 relative">
      <div className="w-full md:w-1/2 flex flex-col justify-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-6 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Experiencia potenciada por IA
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6" style={{ color: 'var(--text-primary, #18181b)' }}>
          El futuro del <br />
          <span className="bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-400 dark:to-indigo-400 bg-clip-text text-transparent">
            shopping inteligente
          </span>
        </h1>

        <p className="text-lg max-w-lg mb-8 leading-relaxed" style={{ color: 'var(--text-secondary, #4b5563)' }}>
          Visualización 3D, recomendaciones con IA y envío predictivo. Todo en una experiencia de compra diseñada para ti.
        </p>

        <div className="flex flex-row gap-4">
          <Link
            to="/catalogo"
            className="px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: 'var(--text-primary, #18181b)', color: 'var(--bg-primary, #ffffff)' }}
          >
            Explorar catálogo &rarr;
          </Link>
          <Link
            to="/catalogo?ofertas=true"
            className="px-8 py-4 rounded-xl font-medium border transition-all"
            style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.5))', borderColor: 'var(--border-color, #d4d4d8)', color: 'var(--text-primary, #18181b)' }}
          >
            Ver ofertas
          </Link>
        </div>
      </div>

      <div className="hidden md:flex w-full md:w-1/2 h-[450px] items-center justify-center relative">
        <div className="absolute w-80 h-80 bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      </div>
    </div>
  );
}
