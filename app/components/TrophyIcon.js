'use client';

import Lottie from "lottie-react";
import trophyData from "../../images/trophy.json";

export default function TrophyIcon({ size = 60 }) {
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Lottie 
        animationData={trophyData} 
        loop={true} 
        style={{ width: '130%', height: '130%' }}
      />
    </div>
  );
}
