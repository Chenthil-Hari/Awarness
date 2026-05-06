'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { calculateLevel } from '@/lib/game';
import LoadingSpinner from '../components/LoadingSpinner';
import './Leaderboard.css';

/* ── League config ── */
const LEAGUES = [
  { id: 'Bronze',      label: 'RECRUIT'   },
  { id: 'Silver',      label: 'SENTINEL'  },
  { id: 'Gold',        label: 'ELITE'     },
  { id: 'Hacker-Tier', label: 'PHANTOM'   },
];

function initials(name = '') {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '??';
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('Bronze');

  // Background Animation
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    let animationFrameId;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for(let i=0; i<80; i++) particles.push({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
      s: Math.random()*2
    });

    const animate = () => {
      ctx.clearRect(0,0,w,h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x<0||p.x>w) p.vx*=-1;
        if(p.y<0||p.y>h) p.vy*=-1;
        ctx.fillStyle = 'rgba(0,243,255,0.3)';
        ctx.fillRect(p.x,p.y,p.s,p.s);
      });
      // Connections
      for(let i=0;i<particles.length;i++) {
        for(let j=i+1;j<particles.length;j++) {
          let dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y;
          let dist = Math.sqrt(dx*dx+dy*dy);
          if(dist<120) {
            ctx.strokeStyle = `rgba(0,243,255,${0.08*(1-dist/120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x,particles[i].y);
            ctx.lineTo(particles[j].x,particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/leaderboard?league=${activeTab}`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [activeTab]);

  const top1 = users[0];
  const top2 = users[1];
  const top3 = users[2];
  const rest = users.slice(3);

  const getAccuracy = (user) => {
      if (!user.performance) return '0%';
      let totalAtt = 0, totalSucc = 0;
      Object.values(user.performance).forEach(cat => {
          totalAtt += cat.attempts || 0;
          totalSucc += cat.successes || 0;
      });
      if (totalAtt === 0) return '0%';
      return Math.round((totalSucc / totalAtt) * 100) + '%';
  };

  const getAccuracyNumber = (user) => {
      const acc = getAccuracy(user);
      return parseInt(acc.replace('%', ''));
  };

  const getStreak = (user) => {
      return user.streak || 0;
  };

  return (
    <div className="lb-page-container relative min-h-screen">
      <canvas ref={canvasRef} className="bg-canvas" id="bgCanvas"></canvas>
      <div className="scanlines"></div>

      {/* Header */}
      <header className="relative z-10 pt-12 pb-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-4 border border-cyan-500/30 px-4 py-1 rounded-full bg-cyan-900/20 text-cyan-400 font-mono text-xs tracking-[0.3em]">
            <i className="fas fa-satellite-dish mr-2 animate-pulse"></i>LIVE DATA FEED // GLOBAL_RANKINGS
          </div>
          <h1 className="glitch-title text-4xl md:text-6xl mb-2" data-text="LEADERBOARD">LEADERBOARD</h1>
          <p className="text-gray-400 max-w-xl mx-auto mt-4 text-lg">Top operatives ranked by XP, accuracy, and mission success rate.</p>
        </div>
      </header>

      {/* Filters */}
      <section className="relative z-10 px-4 mb-8">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
          {LEAGUES.map((l) => (
            <button
              key={l.id}
              className={`cyber-tab ${activeTab === l.id ? 'active' : ''}`}
              onClick={() => setActiveTab(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
         <div className="relative z-10 flex justify-center py-20">
            <LoadingSpinner message="Retrieving data..." />
         </div>
      ) : users.length === 0 ? (
         <div className="relative z-10 flex justify-center py-20 font-mono text-gray-500">
            No operatives found in this sector.
         </div>
      ) : (
        <>
          {/* Podium / Top 3 */}
          <section className="relative z-10 px-4 mb-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              
              {/* 2nd Place */}
              {top2 && (
                <div className="glass podium-card silver p-6 text-center transform scale-95" style={{ order: 1 }}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
                  <div className="text-gray-400 font-mono text-xs tracking-widest mb-3">02 // RUNNER UP</div>
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gray-800 border-2 border-gray-400 flex items-center justify-center relative z-10">
                      {top2.image ? (
                        <img src={top2.image} alt="2nd" className="w-full h-full rounded-full object-cover opacity-90" />
                      ) : (
                        <div className="text-gray-400 font-orbitron text-2xl">{initials(top2.name)}</div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center border border-gray-400 z-20">
                      <span className="text-white font-bold text-sm font-mono">2</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white font-orbitron mb-1">{top2.name?.split(' ')[0]}</h3>
                  <p className="text-gray-400 text-sm mb-2 font-mono">@{top2.username || top2.name?.toLowerCase().replace(/\s+/g, '_')}</p>
                  <div className="text-3xl font-bold text-gray-300 font-orbitron mb-2">{(top2.xp || 0).toLocaleString()}</div>
                  <div className="flex justify-center gap-4 text-xs font-mono text-gray-400">
                    <span><i className="fas fa-bolt text-yellow-500 mr-1"></i>Lvl {calculateLevel(top2.xp || 0)}</span>
                    <span><i className="fas fa-crosshairs text-cyan-400 mr-1"></i>{getAccuracy(top2)}</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top1 && (
                <div className="glass podium-card gold p-8 text-center transform scale-105 relative" style={{ order: 2 }}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_15px_rgba(255,215,0,0.5)]"></div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-4xl animate-pulse">
                    <i className="fas fa-crown"></i>
                  </div>
                  <div className="text-yellow-400 font-mono text-xs tracking-widest mb-3 mt-6">01 // CHAMPION</div>
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-600 to-yellow-900 p-1">
                      <div className="w-full h-full rounded-full bg-black overflow-hidden border-2 border-yellow-400 flex items-center justify-center">
                        {top1.image ? (
                          <img src={top1.image} alt="1st" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-yellow-400 font-orbitron text-3xl">{initials(top1.name)}</div>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-yellow-300 z-20 shadow-[0_0_20px_rgba(255,215,0,0.6)]">
                      <span className="text-black font-bold text-lg font-mono">1</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-orbitron mb-1">{top1.name?.split(' ')[0]}</h3>
                  <p className="text-yellow-500/80 text-sm mb-2 font-mono">@{top1.username || top1.name?.toLowerCase().replace(/\s+/g, '_')}</p>
                  <div className="text-4xl font-bold text-yellow-400 font-orbitron mb-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">{(top1.xp || 0).toLocaleString()}</div>
                  <div className="flex justify-center gap-4 text-xs font-mono text-gray-300">
                    <span><i className="fas fa-bolt text-yellow-400 mr-1"></i>Lvl {calculateLevel(top1.xp || 0)}</span>
                    <span><i className="fas fa-crosshairs text-green-400 mr-1"></i>{getAccuracy(top1)}</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3 && (
                <div className="glass podium-card bronze p-6 text-center transform scale-95" style={{ order: 3 }}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600 to-transparent"></div>
                  <div className="text-orange-400 font-mono text-xs tracking-widest mb-3">03 // THIRD</div>
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-orange-900/30 border-2 border-orange-600 flex items-center justify-center overflow-hidden">
                      {top3.image ? (
                        <img src={top3.image} alt="3rd" className="w-full h-full rounded-full object-cover opacity-90" />
                      ) : (
                        <div className="text-orange-400 font-orbitron text-2xl">{initials(top3.name)}</div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-orange-800 rounded-full flex items-center justify-center border border-orange-500 z-20">
                      <span className="text-white font-bold text-sm font-mono">3</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white font-orbitron mb-1">{top3.name?.split(' ')[0]}</h3>
                  <p className="text-gray-400 text-sm mb-2 font-mono">@{top3.username || top3.name?.toLowerCase().replace(/\s+/g, '_')}</p>
                  <div className="text-3xl font-bold text-orange-300 font-orbitron mb-2">{(top3.xp || 0).toLocaleString()}</div>
                  <div className="flex justify-center gap-4 text-xs font-mono text-gray-400">
                    <span><i className="fas fa-bolt text-orange-400 mr-1"></i>Lvl {calculateLevel(top3.xp || 0)}</span>
                    <span><i className="fas fa-crosshairs text-cyan-400 mr-1"></i>{getAccuracy(top3)}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Rankings Table */}
          {rest.length > 0 && (
            <section className="relative z-10 px-4 mb-20">
              <div className="max-w-6xl mx-auto glass rounded-lg overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-cyan-500/20 bg-black/30 text-xs font-mono text-cyan-400/70 tracking-widest uppercase">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-4">Operative</div>
                  <div className="col-span-2 text-center">Level</div>
                  <div className="col-span-2 text-center">XP</div>
                  <div className="col-span-2 text-center">Accuracy</div>
                  <div className="col-span-1 text-center">Streak</div>
                </div>

                {rest.map((user, idx) => {
                   const rank = idx + 4;
                   const isMe = user.username === session?.user?.username;
                   const lvl = calculateLevel(user.xp || 0);

                   return (
                      <div key={user._id} className={`leader-row grid grid-cols-12 gap-4 p-4 items-center ${isMe ? 'me' : ''}`}>
                        <div className="col-span-2 md:col-span-1 flex justify-center">
                          <div className="rank-badge rank-other text-sm">{rank}</div>
                        </div>
                        <div className="col-span-10 md:col-span-4 flex items-center gap-3">
                          <div className="avatar-frame flex-shrink-0">
                            {user.image ? (
                               <img src={user.image} alt="avatar" />
                            ) : (
                               <div className="w-full h-full rounded-full bg-gray-800 border border-cyan-500/30 flex items-center justify-center font-orbitron text-xs text-cyan-400">
                                  {initials(user.name)}
                               </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-white text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis">
                               {user.name} {isMe && <span className="ml-2 text-[10px] bg-cyan-500/20 text-cyan-400 px-1 py-0.5 rounded font-mono">YOU</span>}
                            </h4>
                            <p className="text-xs text-gray-500 font-mono overflow-hidden text-ellipsis">@{user.username || user.name?.toLowerCase().replace(/\s+/g, '_')}</p>
                          </div>
                        </div>
                        <div className="hidden md:block col-span-2 text-center font-mono text-cyan-400">Lvl {lvl}</div>
                        <div className="hidden md:block col-span-2 text-center font-orbitron font-bold">{(user.xp || 0).toLocaleString()}</div>
                        <div className="hidden md:block col-span-2">
                           <div className="text-right text-xs font-mono mb-1 text-gray-400">{getAccuracy(user)}</div>
                           <div className="xp-bar"><div className="xp-fill" style={{ width: `${getAccuracyNumber(user)}%` }}></div></div>
                        </div>
                        <div className="hidden md:block col-span-1 text-center">
                           <span className="text-orange-400 font-mono text-sm"><i class="fas fa-fire mr-1"></i>{getStreak(user)}</span>
                        </div>
                      </div>
                   );
                })}
              </div>
            </section>
          )}

          {/* Pagination */}
          <section className="relative z-10 px-4 pb-20">
              <div className="max-w-6xl mx-auto flex justify-center items-center gap-4">
                  <button className="px-6 py-2 glass text-cyan-400 font-mono text-xs hover:border-cyan-400 transition clip-path-slant" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}>
                      <i className="fas fa-chevron-left mr-2"></i>PREV
                  </button>
                  <span className="text-gray-400 font-mono text-sm">PAGE 01 / 99</span>
                  <button className="px-6 py-2 glass text-cyan-400 font-mono text-xs hover:border-cyan-400 transition" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}>
                      NEXT<i className="fas fa-chevron-right ml-2"></i>
                  </button>
              </div>
          </section>
        </>
      )}
    </div>
  );
}
