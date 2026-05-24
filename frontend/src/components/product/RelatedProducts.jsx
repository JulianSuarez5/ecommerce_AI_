import { motion } from 'framer-motion';
import ProductCard from '../ui/ProductCard';
import { staggerContainer, staggerItem } from '../../utils/motion';

export default function RelatedProducts({ products }) {
  if (!products?.length) return null;
  return (
    <motion.section
      className="mt-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="mb-6 text-xl font-[800]" style={{ color: 'var(--text-primary)' }}>Productos relacionados</h2>
      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {products.map((p, i) => (
          <motion.div key={p.id} variants={staggerItem}>
            <ProductCard product={p} index={i} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
