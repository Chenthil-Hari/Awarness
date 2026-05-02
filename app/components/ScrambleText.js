'use client';

import { useState, useEffect } from 'react';

const CHARS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-=';

export default function ScrambleText({ text, speed = 40, delay = 0 }) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let iteration = 0;
    let interval = null;

    const startAnimation = () => {
      setIsAnimating(true);
      interval = setInterval(() => {
        setDisplayText(
          text.split('').map((char, index) => {
            if (index < iteration) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('')
        );

        if (iteration >= text.length) {
          clearInterval(interval);
          setIsAnimating(false);
        }

        iteration += 1 / 3;
      }, speed);
    };

    const timeout = setTimeout(startAnimation, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [text, speed, delay]);

  return <span className="scramble-text">{displayText}</span>;
}
