'use client';

import Lottie from 'lottie-react';
import educationAnimation from '../../images/taxi-computer-monitor-with-book-mortarboard-and-stationery-for-online-education.json';

export default function SimulationLottie({ width = 300, height = 300 }) {
  return (
    <div style={{ 
      width: width, 
      height: height, 
      margin: '0 auto',
      position: 'relative',
      filter: 'drop-shadow(0 10px 30px rgba(124, 58, 237, 0.2))'
    }}>
      <Lottie 
        animationData={educationAnimation} 
        loop={true} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
