import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, RefreshCw, Radio } from 'lucide-react';
import Image from 'next/image';

export default function LiveSatellite() {
  const [satelliteData, setSatelliteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNasaData = async () => {
      try {
        setLoading(true);
        setError(false);
        // Using personal NASA API Key
        const apiKey = 'dlEhGUCsQFBasRtDc6LbzdgNqq8ThcoAVozmeZY8';
        const res = await fetch(`https://api.nasa.gov/EPIC/api/natural/images?api_key=${apiKey}`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          const latest = data[0];
          const dateParts = latest.date.split(' ')[0].split('-'); // YYYY-MM-DD
          const year = dateParts[0];
          const month = dateParts[1];
          const day = dateParts[2];
          
          const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${latest.image}.png?api_key=${apiKey}`;
          
          setSatelliteData({
            url: imageUrl,
            caption: latest.caption,
            date: latest.date
          });
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("NASA API Error:", error);
        setError(true);
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
      flexDirection: 'column',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ padding: '6px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
            <Globe size={16} color="var(--accent-primary)" />
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1.5px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>Tactical Surveillance</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <span style={{ 
             fontSize: '0.6rem', 
             fontWeight: 800, 
             color: error ? 'var(--accent-danger)' : 'var(--accent-success)', 
             display: 'flex', 
             alignItems: 'center', 
             gap: '6px',
             background: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
             padding: '4px 8px',
             borderRadius: '6px'
           }}>
             <div style={{ 
               width: '6px', 
               height: '6px', 
               borderRadius: '50%', 
               background: error ? 'var(--accent-danger)' : 'var(--accent-success)', 
               animation: 'pulse 2s infinite' 
             }} />
             {error ? 'SIGNAL INTERRUPTED' : 'LIVE FEED'}
           </span>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        background: '#05070a', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        position: 'relative',
        minHeight: '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: '0.75rem', color: 'var(--accent-primary)' }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px' }}>SYNCHRONIZING ORBITAL PATH...</div>
          </div>
        ) : satelliteData && !error ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              <img 
                src={satelliteData.url} 
                alt="NASA EPIC Earth" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) brightness(0.8) saturate(1.2)' }}
                onError={() => setError(true)}
              />
            </motion.div>
            
            {/* Tactical Overlays */}
            <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(139, 92, 246, 0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '0.6rem', color: 'var(--accent-primary)', fontFamily: 'monospace', textShadow: '0 0 8px rgba(139, 92, 246, 0.5)', textAlign: 'right' }}>
              LAT: 28.572° N<br />
              LON: 80.648° W<br />
              ALT: 1,500,000 KM
            </div>
            <div style={{ 
                position: 'absolute', 
                bottom: '15px', 
                left: '15px', 
                background: 'rgba(0,0,0,0.7)', 
                padding: '6px 10px', 
                borderRadius: '6px',
                fontSize: '0.6rem',
                color: 'var(--accent-secondary)',
                fontFamily: 'monospace',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)',
                letterSpacing: '0.5px'
            }}>
              CAPTURED: {new Date(satelliteData.date).toLocaleString()}
            </div>
            <div className="scanline" />
            <div className="vignette" />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Radio size={32} color="var(--accent-danger)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-danger)', letterSpacing: '2px', marginBottom: '4px' }}>SIGNAL LOST</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', maxWidth: '200px' }}>ENCRYPTION MISMATCH DETECTED. RE-AUTHENTICATION REQUIRED.</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem' }}>
         <div style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>System Node</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>GDI-SAT-7</div>
         </div>
         <div style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Bandwidth</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: error ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>
              {error ? '0.0 kbps' : '842.1 mbps'}
            </div>
         </div>
      </div>
      
      <style jsx>{`
        .spin { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
        .scanline {
          position: absolute;
          top: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.05) 50%, transparent);
          animation: scan 8s linear infinite;
          pointer-events: none;
        }
        .vignette {
          position: absolute;
          inset: 0;
          box-shadow: inset 0 0 60px rgba(0,0,0,0.8);
          pointer-events: none;
        }
        @keyframes scan { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
      `}</style>
    </div>
  );
}
