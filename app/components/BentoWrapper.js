'use client';

import { useSession } from 'next-auth/react';
import Navbar from './Navbar';
import BottomDock from './BottomDock/BottomDock';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BentoWrapper({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/auth');
  
  if (status === 'loading') return children;

  if (!session || isAuthPage) {
    return (
      <>
        {!isAuthPage && <Navbar />}
        {children}
      </>
    );
  }

  return (
    <div className="virtual-device-env">
      <div className="device-vignette" />
      
      <motion.div 
        className="tablet-frame"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bezel-top">
          <div className="camera-lens" />
          <div className="sensor-array" />
        </div>
        
        <div className="tablet-screen">
          <div className="screen-reflection" />
          <div className="screen-content">
            {children}
          </div>
          <BottomDock />
        </div>

        <div className="bezel-bottom">
          <div className="home-indicator" />
        </div>
        
        {/* Physical Side Buttons */}
        <div className="side-button volume-up" />
        <div className="side-button volume-down" />
        <div className="side-button power" />
      </motion.div>
      
      <style jsx global>{`
        .virtual-device-env {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, #1a1a2e 0%, #0a0a0c 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          perspective: 1000px;
        }

        .device-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%);
          pointer-events: none;
        }

        .tablet-frame {
          position: relative;
          width: 90vw;
          height: 90vh;
          max-width: 1400px;
          max-height: 900px;
          background: #1c1c1e;
          border-radius: 48px;
          padding: 12px;
          box-shadow: 
            0 50px 100px rgba(0,0,0,0.8),
            0 0 0 1px rgba(255,255,255,0.05),
            inset 0 0 20px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          border: 4px solid #2c2c2e;
        }

        .tablet-screen {
          flex: 1;
          background: #000;
          border-radius: 36px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: inset 0 0 40px rgba(0,0,0,1);
        }

        .screen-content {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          padding-top: 60px; /* Space for status bar */
          scrollbar-width: none;
        }
        .screen-content::-webkit-scrollbar { display: none; }

        .screen-reflection {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%, rgba(255,255,255,0.02) 100%);
          pointer-events: none;
          z-index: 10;
        }

        .bezel-top {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .camera-lens {
          width: 8px;
          height: 8px;
          background: #000;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .sensor-array {
          width: 40px;
          height: 4px;
          background: #000;
          border-radius: 2px;
        }

        .bezel-bottom {
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .home-indicator {
          width: 120px;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }

        .side-button {
          position: absolute;
          background: #2c2c2e;
          border-radius: 2px;
        }

        .power {
          width: 4px;
          height: 60px;
          right: -8px;
          top: 100px;
        }

        .volume-up {
          width: 4px;
          height: 40px;
          left: -8px;
          top: 100px;
        }

        .volume-down {
          width: 4px;
          height: 40px;
          left: -8px;
          top: 150px;
        }

        @media (max-width: 1024px) {
          .tablet-frame {
            width: 98vw;
            height: 98vh;
            border-radius: 32px;
          }
          .tablet-screen {
            border-radius: 24px;
          }
        }
      `}</style>
    </div>
  );
}
