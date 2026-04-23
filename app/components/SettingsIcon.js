'use client';

import Lottie from "lottie-react";
import settingsData from "../../images/settings.json";

export default function SettingsIcon({ size = 24 }) {
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Lottie 
        animationData={settingsData} 
        loop={true} 
        style={{ width: '120%', height: '120%' }}
      />
    </div>
  );
}
