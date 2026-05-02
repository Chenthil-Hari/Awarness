'use client';

import { motion } from 'framer-motion';
import './AuroraBackground.css';

export default function AuroraBackground() {
  return (
    <div className="aurora-container">
      <motion.div 
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="blob blob-1"
      />
      <motion.div 
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 50, -50, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="blob blob-2"
      />
      <motion.div 
        animate={{
          x: [100, 0, -100, 100],
          y: [-50, 100, -50, -50],
          scale: [1.2, 1, 0.8, 1.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="blob blob-3"
      />
      <div className="aurora-overlay" />
    </div>
  );
}
