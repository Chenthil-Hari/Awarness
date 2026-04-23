'use client';

import Lottie from "lottie-react";
import fireData from "../../images/fire.json";

export default function StreakIcon({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Lottie 
        animationData={fireData} 
        loop={true} 
        style={{ width: '150%', height: '150%' }} // Scaling slightly up to fill the container nicely
      />
    </div>
  );
}
