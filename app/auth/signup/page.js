'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../auth.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clock, setClock] = useState('00:00:00');
  const [sid, setSid] = useState('');
  const router = useRouter();
  const canvasRef = useRef(null);

  useEffect(() => {
    // Clock
    const updateClock = () => setClock(new Date().toTimeString().slice(0,8));
    const clockInterval = setInterval(updateClock, 1000);
    updateClock();

    // Session ID
    setSid(Array.from({length:8}, () => Math.floor(Math.random()*16).toString(16).toUpperCase()).join(''));

    // Matrix Rain
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let cols, drops;

      const initMatrix = () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        const fontSize = 14;
        cols = Math.floor(canvas.width / fontSize);
        drops = Array(cols).fill(1);
      };

      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(2,13,4,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff41';
        ctx.font = '14px "Share Tech Mono", monospace';
        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01ABCDEF';
        drops.forEach((y, i) => {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(ch, i * 14, y * 14);
          if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        });
      };

      initMatrix();
      window.addEventListener('resize', initMatrix);
      const matrixInterval = setInterval(drawMatrix, 40);

      return () => {
        clearInterval(clockInterval);
        clearInterval(matrixInterval);
        window.removeEventListener('resize', initMatrix);
      };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/auth/login?success=Account created successfully');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="cyber-body">
      <canvas id="matrix-canvas" ref={canvasRef} className="matrix-canvas"></canvas>
      <div className="circuit-overlay"></div>
      <div className="scanline"></div>

      {/* Decorative network ring (SVG) */}
      <svg className="nodes-ring" viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
        <circle cx="210" cy="210" r="200" fill="none" stroke="#00ff41" strokeWidth="0.8"/>
        <circle cx="210" cy="210" r="140" fill="none" stroke="#00ff41" strokeWidth="0.5" strokeDasharray="4 6"/>
        <g stroke="#00ff41" strokeWidth="0.6" opacity="0.7">
          <line x1="210" y1="10"  x2="210" y2="410"/>
          <line x1="10"  y1="210" x2="410" y2="210"/>
          <line x1="68"  y1="68"  x2="352" y2="352"/>
          <line x1="352" y1="68"  x2="68"  y2="352"/>
          <line x1="68"  y1="68"  x2="352" y2="68"/>
          <line x1="68"  y1="352" x2="352" y2="352"/>
          <line x1="350" y1="140" x2="210" y2="410"/>
          <line x1="70"  y1="140" x2="210" y2="410"/>
          <line x1="350" y1="280" x2="210" y2="10"/>
          <line x1="70"  y1="280" x2="210" y2="10"/>
        </g>
        <g fill="#00ff41">
          <circle cx="210" cy="10"  r="5"/>
          <circle cx="210" cy="410" r="5"/>
          <circle cx="10"  cy="210" r="5"/>
          <circle cx="410" cy="210" r="5"/>
          <circle cx="68"  cy="68"  r="5"/>
          <circle cx="352" cy="68"  r="5"/>
          <circle cx="68"  cy="352" r="5"/>
          <circle cx="352" cy="352" r="5"/>
          <circle cx="350" cy="140" r="4"/>
          <circle cx="70"  cy="140" r="4"/>
          <circle cx="350" cy="280" r="4"/>
          <circle cx="70"  cy="280" r="4"/>
          <circle cx="210" cy="210" r="6" opacity="0.5"/>
        </g>
      </svg>

      <div className="panel-wrap">
        <div className="status-bar">
          <span>SYS//NEW_NODE_REG</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="status-dot"></div>
            <span>{clock}</span>
          </div>
          <span>ENC:AES-256</span>
        </div>

        <div className="panel">
          <div className="corner tr"></div>
          <div className="corner bl"></div>

          <div className="logo-row">
            <div className="logo-icon">⬡</div>
            <div className="logo-text">SECURE REGISTRATION</div>
          </div>
          <div className="subtitle">Initialize Operative Profile</div>

          <div className="divider"></div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Operative Name</label>
              <div className="input-wrap">
                <input 
                  type="text" 
                  placeholder="enter_full_name" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Operative Email</label>
              <div className="input-wrap">
                <input 
                  type="email" 
                  placeholder="enter_email_id" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Secure Password</label>
              <div className="input-wrap">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••••••" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="eye-btn" 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  ◉
                </button>
              </div>
            </div>

            <button type="submit" className={`cyber-btn ${loading ? 'loading' : ''}`}>
              <span className="btn-text">Initialize Profile</span>
              <span className="btn-spinner">Registering...</span>
            </button>
          </form>

          <button 
            type="button" 
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="cyber-btn google-btn"
          >
            <span className="btn-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GoogleIcon /> Auth via Google
            </span>
          </button>

          <div className="switch-link">
            Already authorized? <Link href="/auth/login">Return to Login</Link>
          </div>
        </div>

        <div className="bottom-bar">
          <span>CONN: ENCRYPTED</span>
          <span>SID://{sid}</span>
          <span>TLS 1.3</span>
        </div>
      </div>
    </div>
  );
}
