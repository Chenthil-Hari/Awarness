'use client';

import Lottie from "lottie-react";
import profileData from "../../images/verified-user.json";

export default function ProfileIcon({ size = 24 }) {
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Lottie 
        animationData={profileData} 
        loop={true} 
        style={{ width: '130%', height: '130%' }}
      />
    </div>
  );
}
