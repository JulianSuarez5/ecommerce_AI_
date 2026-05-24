import { motion, AnimatePresence } from 'framer-motion';

export { motion, AnimatePresence };

export const spring = { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 };
export const springHeavy = { type: 'spring', stiffness: 200, damping: 20, mass: 1.2 };
export const springPeppy = { type: 'spring', stiffness: 400, damping: 20, mass: 0.6 };
export const smooth = { duration: 0.4, ease: [0.32, 0.72, 0, 1] };
export const smoothIn = { duration: 0.5, ease: [0.16, 1, 0.3, 1] };
export const smoothOut = { duration: 0.2, ease: [0.4, 0, 1, 1] };

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: smoothIn },
};

export const slideUpHeavy = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export const slideDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: smooth },
};

export const slideLeft = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: smooth },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: spring },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { ...smoothIn } },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const staggerContainerSlow = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const cardHover = {
  rest: { scale: 1, y: 0, boxShadow: 'var(--shadow-card)' },
  hover: {
    scale: 1.02,
    y: -6,
    boxShadow: 'var(--shadow-hover)',
    transition: spring,
  },
};

export const cardTap = { scale: 0.98 };

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: springPeppy },
  tap: { scale: 0.95 },
};

export const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.15 } },
};

export const imageHover = {
  rest: { scale: 1 },
  hover: { scale: 1.08, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

export const badgeReveal = {
  hidden: { opacity: 0, x: -12, scale: 0.8 },
  visible: { opacity: 1, x: 0, scale: 1, transition: springPeppy },
};

export const countUp = {
  hidden: { opacity: 0, y: 20, scale: 0.5 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...spring, delay: i * 0.05 },
  }),
};

export const featuredCard = {
  hidden: { opacity: 0, x: 50, scale: 0.9 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { ...spring, delay: i * 0.03 },
  }),
};

export const float = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },
};

export const cartBadge = {
  initial: { scale: 0.5, opacity: 0 },
  animate: {
    scale: [0.5, 1.3, 1],
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};
