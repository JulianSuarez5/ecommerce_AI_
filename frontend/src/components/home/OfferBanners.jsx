import { motion } from 'framer-motion';
import { PLACEHOLDER_OFFERS } from '../../utils/placeholders';

export default function OfferBanners() {
  if (PLACEHOLDER_OFFERS.length === 0) return null;
  return (
    <section className="py-14 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLACEHOLDER_OFFERS.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl p-6 group cursor-default transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, rgba(240,192,64,0.08) 0%, rgba(240,192,64,0.02) 100%)`,
                border: `1px solid rgba(240,192,64,0.12)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(240,192,64,0.03)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative">
                <p className="text-base font-semibold mb-1 text-zinc-900 dark:text-white">{offer.title}</p>
                <p className="text-xs mb-3 text-zinc-500 dark:text-zinc-400">{offer.desc}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f0c040]/15 text-[#f0c040]">
                  {offer.code}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
