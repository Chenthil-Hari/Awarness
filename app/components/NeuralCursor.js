'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import './NeuralCursor.css';

export default function NeuralCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { damping: 25, stiffness: 250 };
  const sx = useSpring(cursorX, springConfig);
  const sy = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleHover = (e) => {
      if (e.target.closest('button, a, .clickable, .scenario-card, .nav-item')) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div 
        className={`neural-cursor ${isHovered ? 'hovered' : ''}`}
        style={{ x: sx, y: sy }}
      >
        <div className="cursor-inner" />
        <div className="cursor-glow" />
      </motion.div>
      <div className="cursor-particles">
        {/* Subtle trail logic could go here, but keep it simple for now */}
      </div>
    </>
  );
}
