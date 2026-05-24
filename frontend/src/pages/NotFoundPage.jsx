import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const ROBOT_IMG = 'https://cdn.prod.website-files.com/6501f1891917bde75ab542ee/653e8be9ae6bc59344b62ff3_robot-phunk%201.webp';

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary, linear-gradient(135deg, #f4f7f6 0%, #e9eff1 50%, #dfe9ec 100%))' }}
    >
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Robot Bender confused */}
        <motion.div
          className="inline-block mb-6"
          animate={{ rotate: [0, -3, 3, -3, 0], x: [0, -5, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src={ROBOT_IMG} alt="Bender" className="w-40 h-40 object-contain" />
        </motion.div>

        {/* Speech bubble */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-block mb-8"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '16px',
              height: '16px',
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
            }}
          />
          <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
            Mmm... esta página no existe. 🤔
          </p>
        </motion.div>

        <h1 className="text-8xl font-[900] mb-2" style={{ color: 'var(--text-tertiary)', opacity: 0.3 }}>
          404
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          Parece que nos perdimos en el camino
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-text)',
              boxShadow: '0 4px 16px rgba(20,184,166,0.3)',
            }}
          >
            <Home size={18} />
            Llevarme al inicio →
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
