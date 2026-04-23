'use client';

import Lottie from "lottie-react";
import levelData from "../../images/line-chart.json";

export default function LevelIcon({ size = 20 }) {
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Lottie 
        animationData={levelData} 
        loop={true} 
        style={{ width: '140%', height: '140%' }}
      />
    </div>
  );
}
