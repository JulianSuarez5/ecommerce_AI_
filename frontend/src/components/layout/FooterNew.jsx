import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { motion, spring, slideUp, staggerContainer, staggerItem } from '../../utils/motion';

const quickLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Ofertas', to: '/catalogo?ofertas=true' },
  { label: 'Contacto', to: '#' },
];

const helpLinks = [
  { label: 'FAQ', to: '#' },
  { label: 'Envíos', to: '#' },
  { label: 'Devoluciones', to: '#' },
  { label: 'Términos', to: '#' },
  { label: 'Privacidad', to: '#' },
];

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'info@centrova.com', href: 'mailto:info@centrova.com' },
  { icon: Phone, label: 'Teléfono', value: '+57 300 123 4567', href: 'tel:+573001234567' },
  { icon: MapPin, label: 'Dirección', value: 'Bogotá, Colombia', href: '#' },
];

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
];

export default function Footer() {
  return (
    <motion.footer
      className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5"
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-lg font-bold tracking-tight text-ink dark:text-ink-dark">CENTROVA</span>
            </Link>
            <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary mb-5 leading-relaxed">
              Experiencia de compra premium con tecnología 3D, IA integrada y un showroom digital moderno.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  title={label}
                  className="w-9 h-9 rounded-lg bg-surface-tertiary dark:bg-surface-tertiary/50 flex items-center justify-center text-ink-secondary dark:text-ink-dark-secondary hover:text-accent-500 hover:bg-accent-500/10 transition-all"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark">Navegación</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-sm text-ink-secondary dark:text-ink-dark-secondary hover:text-accent-500 transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark">Ayuda</h4>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-sm text-ink-secondary dark:text-ink-dark-secondary hover:text-accent-500 transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark">Contacto</h4>
            <ul className="space-y-3">
              {contactInfo.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-flex items-start gap-3 text-sm text-ink-secondary dark:text-ink-dark-secondary hover:text-accent-500 transition-colors group"
                  >
                    <item.icon size={14} className="shrink-0 mt-0.5 text-ink-tertiary dark:text-ink-dark-tertiary group-hover:text-accent-500" />
                    <span>{item.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={staggerItem} className="lg:col-span-1">
            <h4 className="mb-6 text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark">Novedades</h4>
            <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary mb-4">
              Suscríbete para recibir actualizaciones y ofertas exclusivas.
            </p>
            <motion.div className="flex gap-2" whileFocusWithin={{ scale: 1.01 }}>
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-surface-tertiary dark:bg-surface-tertiary/50 border border-border dark:border-border-dark text-ink dark:text-ink-dark placeholder-ink-tertiary dark:placeholder-ink-dark-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <motion.button
                className="px-3 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 pt-8 border-t border-border dark:border-border-dark"
          variants={slideUp}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-ink-tertiary dark:text-ink-dark-tertiary">
            <p>&copy; {new Date().getFullYear()} CENTROVA. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              {['Política de privacidad', 'Términos de servicio', 'Cookies'].map((link) => (
                <Link key={link} to="#" className="hover:text-accent-500 transition-colors">{link}</Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
