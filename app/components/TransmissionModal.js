'use client';

import { useState, useEffect, useRef } from 'react';
import '../vault-shield.css';

export default function TransmissionModal({ scenario, isOpen, onClose, onAccept }) {
  const [cd, setCd] = useState(30);
  const [step, setStep] = useState(0); // 0: init, 1: operative reveal, 2: message typing, 3: details/actions
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // Generate a mock briefing based on the scenario
  const briefing = scenario ? `Operative, we've intercepted a threat involving ${scenario.title}. ${scenario.description} Analyze, intercept, and neutralize.` : '';

  useEffect(() => {
    if (isOpen && scenario) {
      setCd(30);
      setStep(0);
      setTypedMessage('');
      setIsTyping(false);

      // Animation sequence
      const t1 = setTimeout(() => setStep(1), 300);
      const t2 = setTimeout(() => {
        setStep(2);
        setIsTyping(true);
        let i = 0;
        const iv = setInterval(() => {
          setTypedMessage(prev => prev + briefing.charAt(i));
          i++;
          if (i >= briefing.length) {
            clearInterval(iv);
            setIsTyping(false);
            setStep(3);
          }
        }, 28);
        return () => clearInterval(iv);
      }, 800);

      const cdIv = setInterval(() => {
        setCd(prev => {
          if (prev <= 1) {
            clearInterval(cdIv);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Noise static canvas
      const sctx = canvasRef.current?.getContext('2d');
      if (sctx && canvasRef.current) {
        const drawStatic = () => {
          const cvs = canvasRef.current;
          if (!cvs) return;
          cvs.width = cvs.offsetWidth || 640;
          cvs.height = cvs.offsetHeight || 400;
          const imgData = sctx.createImageData(cvs.width, cvs.height);
          for (let i = 0; i < imgData.data.length; i += 4) {
            const v = Math.random() * 255 | 0;
            imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = v;
            imgData.data[i + 3] = 255;
          }
          sctx.putImageData(imgData, 0, 0);
          rafRef.current = requestAnimationFrame(drawStatic);
        };
        drawStatic();
      }

      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearInterval(cdIv);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, scenario, briefing, onClose]);

  if (!isOpen || !scenario) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="transmission">
        <canvas ref={canvasRef} className="staticCanvas"></canvas>
        <div className="crt-frame">
          <div className="glitch-bar"></div>
          <div className="tx-header">
            <div className="tx-header-left">
              <div className="tx-blink"></div>
              <span>Incoming Transmission // Encrypted</span>
            </div>
            <button className="tx-close" onClick={onClose}>✕</button>
          </div>

          <div className="tx-body">
            <div className={`tx-operative ${step >= 1 ? 'reveal' : ''}`}>Operative — Classification: Red Alpha</div>
            <div className="tx-message">
              <span>{typedMessage}</span>
              {isTyping && <span className="typed-text"></span>}
            </div>

            <div className={`tx-details ${step >= 3 ? 'reveal' : ''}`}>
              <div className="tx-detail-item">
                <div className="tx-detail-label">Threat Vector</div>
                <div className="tx-detail-val">{scenario.domain || 'Cyber'}</div>
              </div>
              <div className="tx-detail-item">
                <div className="tx-detail-label">Severity</div>
                <div className="tx-detail-val">{scenario.difficulty === 'Advanced' ? 'CRITICAL' : 'HIGH'}</div>
              </div>
              <div className="tx-detail-item">
                <div className="tx-detail-label">Target System</div>
                <div className="tx-detail-val">Corporate Network</div>
              </div>
              <div className="tx-detail-item">
                <div className="tx-detail-label">Time to Breach</div>
                <div className="tx-detail-val">{scenario.duration || '12 MIN'} REMAINING</div>
              </div>
            </div>

            <div className={`tx-actions ${step >= 3 ? 'reveal' : ''}`}>
              <button className="btn-accept" onClick={() => onAccept(scenario)}>▶ Accept Mission</button>
              <button className="btn-decline" onClick={onClose}>Stand Down</button>
            </div>
            <div className="tx-countdown">
              <span>Auto-close in</span>
              <span className="cdNum">{cd}</span>
            </div>
          </div>

          <div className="crt-bottom">
            <div className="tx-progress-bar" style={{ transition: `transform ${cd}s linear`, transform: 'scaleX(0)' }}></div>
            <span>SRC: RELAY-7 // DARKNET</span>
            <span>{new Date().toISOString().slice(0,19)+'Z'}</span>
            <span>END-TO-END ENCRYPTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
