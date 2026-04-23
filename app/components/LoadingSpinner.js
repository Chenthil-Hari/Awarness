'use client';

import Lottie from "lottie-react";
import loadingData from "../../images/circle-loading.json";

export default function LoadingSpinner({ size = 200, message = "Loading..." }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ width: size, height: size }}>
        <Lottie animationData={loadingData} loop={true} />
      </div>
      {message && (
        <p style={{ 
          marginTop: '1rem', 
          color: 'var(--text-secondary)', 
          fontWeight: 600,
          fontSize: '0.9rem',
          letterSpacing: '0.05rem',
          textTransform: 'uppercase'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
