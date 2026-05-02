'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, RefreshCw, Radio } from 'lucide-react';

export default function LiveSatellite() {
  const [satelliteData, setSatelliteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNasaData = async () => {
      try {
        // Fetching from NASA EPIC (Earth Polychromatic Imaging Camera)
        const res = await fetch('https://api.nasa.gov/EPIC/api/natural/images?api_key=DEMO_KEY');
        const data = await res.json();
        
        if (data && data.length > 0) {
          const latest = data[0];
          const date = latest.date.split(' ')[0].replace(/-/g, '/');
          const imageUrl = `https://api.nasa.gov/EPIC/archive/natural/${date}/png/${latest.image}.png?api_key=DEMO_KEY`;
          
          setSatelliteData({
            url: imageUrl,
            caption: latest.caption,
            date: latest.date
          });
        }
      } catch (error) {
        console.error("NASA API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNasaData();
  }, []);

  return (
    <div style={{
      padding: '1.5rem',
      background: 'var(--bg-tertiary)',
      borderRadius: '24px',
      border: '1px solid var(--glass-border)',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', color: 'var(--text-primary)' }}>TACTICAL SURVEILLANCE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
             <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-success)', animation: 'pulse 2s infinite' }} />
             LIVE FEED
           </span>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        background: '#000', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        position: 'relative',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>SYNCHRONIZING ORBIT...</div>
          </div>
        ) : satelliteData ? (
          <>
            <motion.img 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              src={satelliteData.url} 
              alt="NASA EPIC Earth" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) brightness(0.9)' }}
            />
            {/* Tactical Overlays */}
            <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(0, 255, 255, 0.1)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.6rem', color: '#00ff00', fontFamily: 'monospace', textShadow: '0 0 5px #00ff00' }}>
              LAT: 28.57° N<br />LON: 80.64° W
            </div>
            <div style={{ 
                position: 'absolute', 
                bottom: '10px', 
                left: '10px', 
                background: 'rgba(0,0,0,0.6)', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '0.6rem',
                color: 'white',
                fontFamily: 'monospace',
                backdropFilter: 'blur(4px)'
            }}>
              TIMESTAMP: {satelliteData.date}
            </div>
            <div className="scanline" />
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SIGNAL LOST</div>
        )}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
         <div style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '2px' }}>ORBITAL SECTOR</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900 }}>GDI-SATELLITE-7</div>
         </div>
         <div style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '2px' }}>SIGNAL STRENGTH</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-primary)' }}>98.2%</div>
         </div>
      </div>
      
      <style jsx>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
        .scanline {
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: rgba(255,255,255,0.1);
          animation: scan 4s linear infinite;
          pointer-events: none;
        }
        @keyframes scan { from { top: 0; } to { top: 100%; } }
      `}</style>
    </div>
  );
}
