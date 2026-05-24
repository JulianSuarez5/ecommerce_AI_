import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FEATURES = [
  { icon: '🔄', text: 'Ver productos en 3D y rotarlos' },
  { icon: '🤖', text: 'Consultar con IA antes de comprar' },
  { icon: '🎨', text: 'Personalizar tu experiencia visual' },
  { icon: '⚡', text: 'Recibir ofertas personalizadas' },
]

export default function RobotGreeting() {
  const [visible, setVisible] = useState(false)
  const [visibleFeatures, setVisibleFeatures] = useState([])
  const [typed, setTyped] = useState('')

  const GREETING = '¡Hola! Soy Bender, tu asistente ✨'

  useEffect(() => {
    const already = localStorage.getItem('centrova-robot-greeted')
    if (already) return

    const timer = setTimeout(() => {
      setVisible(true)
      let i = 0
      const interval = setInterval(() => {
        setTyped(GREETING.slice(0, i + 1))
        i++
        if (i >= GREETING.length) {
          clearInterval(interval)
          FEATURES.forEach((_, idx) => {
            setTimeout(() => {
              setVisibleFeatures(prev => [...prev, idx])
            }, 300 + idx * 400)
          })
        }
      }, 40)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('centrova-robot-greeted', 'true')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            position: 'absolute',
            bottom: '110%',
            right: '-20px',
            width: '280px',
            background: 'var(--bg-surface, #1a2f42)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            borderRadius: '16px',
            padding: '16px',
            zIndex: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Cola triangular */}
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '40px',
              width: '16px',
              height: '16px',
              background: 'var(--bg-surface, #1a2f42)',
              borderRight: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              transform: 'rotate(45deg)',
              zIndex: -1,
            }}
          />

          <button
            onClick={dismiss}
            aria-label="Cerrar saludo"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
              color: 'var(--text-tertiary, #607080)',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary, #607080)')}
          >
            ✕
          </button>

          <p
            style={{
              color: 'var(--text-primary, #f0f0f0)',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px',
              minHeight: '20px',
              paddingRight: '20px',
            }}
          >
            {typed}
            <span
              style={{
                animation: 'blink 1s infinite',
                marginLeft: '2px',
                opacity: 0.7,
              }}
            >
              |
            </span>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FEATURES.map((f, i) => (
              <AnimatePresence key={i}>
                {visibleFeatures.includes(i) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: 'var(--text-secondary, #a0b4c0)',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{f.icon}</span>
                    <span>{f.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          {visibleFeatures.length === FEATURES.length && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={dismiss}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '8px',
                background: 'var(--accent, #14b8a6)',
                color: 'var(--accent-text, #ffffff)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover, #0d9488)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent, #14b8a6)')}
            >
              ¡Explorar ahora! →
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
