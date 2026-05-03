'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function NeuralTransition({ children }) {
  const pathname = usePathname();

  const variants = {
    initial: { 
      opacity: 0, 
      filter: 'blur(20px) brightness(2) contrast(2)',
      scale: 1.1
    },
    animate: { 
      opacity: 1, 
      filter: 'blur(0px) brightness(1) contrast(1)',
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.19, 1.0, 0.22, 1.0]
      }
    },
    exit: { 
      opacity: 0, 
      filter: 'blur(10px) hue-rotate(90deg) brightness(0)',
      scale: 0.9,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        style={{ width: '100%', minHeight: '100vh' }}
      >
        {/* The "Glitch" Overlay - subtle flicker on transition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 0.5, times: [0, 0.5, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'white',
            zIndex: 9999,
            pointerEvents: 'none',
            mixBlendMode: 'overlay'
          }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
