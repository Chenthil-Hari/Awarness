'use client';

import Lottie from 'lottie-react';
import drillAnimation from '../../images/techny-receiving-a-letter-or-email.json';

export default function DrillLottie({ width = 300, height = 300 }) {
  return (
    <div style={{ 
      width: width, 
      height: height, 
      margin: '0 auto',
      position: 'relative',
      filter: 'drop-shadow(0 10px 30px rgba(124, 58, 237, 0.15))'
    }}>
      <Lottie 
        animationData={drillAnimation} 
        loop={true} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
