export default function FooterSection() {
  return (
    <footer className="border-t" style={{ backgroundColor: 'var(--bg-surface, #18181b)', borderColor: 'var(--border-color, rgba(255,255,255,0.1))' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-white">CENTROVA</h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-tertiary, #a1a1aa)' }}>
              Tecnología, moda y hogar con vista 3D, IA y envío inteligente.
            </p>
            <div className="flex gap-4">
              {['Instagram', 'Twitter', 'TikTok'].map((social) => (
                <a key={social} href={`https://${social.toLowerCase()}.com/centrova`} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium uppercase tracking-wider transition-colors hover:text-white"
                  style={{ color: 'var(--text-tertiary, #a1a1aa)' }}>
                  {social}
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Productos', links: ['Catálogo', 'Ofertas', 'Novedades', 'Más vendidos'] },
            { title: 'Ayuda', links: ['FAQ', 'Envíos', 'Devoluciones', 'Contacto'] },
            { title: 'Empresa', links: ['Sobre nosotros', 'Trabaja con nosotros', 'Prensa', 'Privacidad'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--text-tertiary, #71717a)' }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm transition-colors duration-200 hover:text-white" style={{ color: 'var(--text-tertiary, #a1a1aa)' }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 text-center text-xs border-t" style={{ borderColor: 'var(--border-color, rgba(255,255,255,0.1))', color: 'var(--text-tertiary, #71717a)' }}>
          &copy; {new Date().getFullYear()} CENTROVA. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
