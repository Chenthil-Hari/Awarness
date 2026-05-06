'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Shop.css';

const SHOP_ITEMS = [
    { id: 'item_extinguisher', name: 'Class-K Extinguisher', category: 'tactical', catLabel: 'Tactical', price: 450, icon: 'fa-fire-extinguisher', desc: 'Essential gear for the "Kitchen Crisis". Prevents critical failure in grease fire scenarios.' },
    { id: 'item_yubikey', name: 'Hardware Security Key', category: 'cyber-gear', catLabel: 'Cyber-Gear', price: 800, icon: 'fa-usb', desc: 'Neural-link protection. Automatically detects 100% of basic phishing links in Live Drills.' },
    { id: 'item_first_aid', name: 'Tactical Med-Kit', category: 'life-skills', catLabel: 'Life-Skills', price: 500, icon: 'fa-medkit', desc: 'Includes trauma supplies for "Emergency Response" scenarios. Increases success probability.' },
    { id: 'item_privacy_filter', name: 'Neural Privacy Screen', category: 'tactical', catLabel: 'Tactical', price: 600, icon: 'fa-user-secret', desc: 'Reduces the visibility of "Social Engineering" threats by 40% during surveillance missions.' },
    { id: 'theme_hacker', name: 'Terminal Zero Theme', category: 'interface', catLabel: 'Interface', price: 2000, icon: 'fa-terminal', desc: 'A full-system overhaul with a high-fidelity "Black & Green" matrix aesthetic.' },
    { id: 'xp_boost_elite', name: 'Neural Optimizer (24h)', category: 'neural', catLabel: 'Neural', price: 1500, icon: 'fa-brain', desc: 'Advanced data processing. Grants a 2.5x XP multiplier for all successfully neutralized threats.' }
];

export default function ShopPage() {
    const { data: session, status, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [purchaseStatus, setPurchaseStatus] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    
    // XP Animation state
    const [displayXp, setDisplayXp] = useState(0);

    const canvasRef = useRef(null);

    useEffect(() => {
        if (session?.user?.inventory) {
            setInventory(session.user.inventory);
        }
        if (session?.user?.xp) {
            // Animate XP counter
            const targetXP = session.user.xp;
            let currentXP = displayXp;
            const step = 50;
            const interval = setInterval(() => {
                currentXP += Math.ceil((targetXP - currentXP) / 10);
                if(currentXP >= targetXP) { 
                    currentXP = targetXP; 
                    clearInterval(interval); 
                }
                setDisplayXp(currentXP);
            }, step);
            return () => clearInterval(interval);
        }
    }, [session]);

    // Background animation
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        for(let i=0; i<80; i++) particles.push({
            x: Math.random()*canvas.width, y: Math.random()*canvas.height,
            vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
            s: Math.random()*1.5
        });

        const animate = () => {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if(p.x<0||p.x>canvas.width) p.vx*=-1;
                if(p.y<0||p.y>canvas.height) p.vy*=-1;
                ctx.fillStyle = 'rgba(0,243,255,0.2)';
                ctx.fillRect(p.x,p.y,p.s,p.s);
            });
            for(let i=0;i<particles.length;i++) {
                for(let j=i+1;j<particles.length;j++){
                    let dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
                    let dist=Math.sqrt(dx*dx+dy*dy);
                    if(dist<120){
                        ctx.strokeStyle=`rgba(0,243,255,${0.05*(1-dist/120)})`;
                        ctx.lineWidth=0.5;
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

    const handlePurchase = async (item) => {
        if (session.user.xp < item.price) return;
        
        setLoading(item.id);
        try {
            const res = await fetch('/api/shop/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemId: item.id,
                    price: item.price,
                    itemName: item.name
                })
            });

            if (res.ok) {
                setPurchaseStatus({ id: item.id, message: `Successfully acquired: ${item.name}` });
                setInventory(prev => [...prev, item.id]);
                update(); // Refresh session to reflect XP change
                
                // Show toast
                const toast = document.getElementById('toast');
                toast.classList.remove('translate-y-20', 'opacity-0');
                setTimeout(() => {
                    toast.classList.add('translate-y-20', 'opacity-0');
                    setPurchaseStatus(null);
                }, 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Transaction failed');
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner message="Accessing Vault..." /></div>;

    const filteredItems = activeFilter === 'all' 
        ? SHOP_ITEMS 
        : SHOP_ITEMS.filter(i => i.category === activeFilter);

    const userXp = session?.user?.xp || 0;

    return (
        <div className="min-h-screen relative">
            <canvas ref={canvasRef} id="bgCanvas"></canvas>
            <div className="scanlines"></div>

            {/* Main Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                
                {/* VAULT HEADER */}
                <div className="vault-header text-center mb-12 py-12 rounded-2xl border border-cyan-500/10 bg-black/20">
                    <div className="inline-flex items-center gap-3 border border-cyan-500/30 px-4 py-1 rounded-full bg-cyan-900/20 text-cyan-400 font-mono text-xs tracking-[0.2em] mb-8">
                        <i className="fas fa-unlock-alt animate-pulse"></i> NEUTRALIZED THREAT DATA CONVERSION
                    </div>
                    
                    <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white uppercase mb-4 tracking-wider drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                        XP VAULT
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
                        Exchange your neutralized threat data (XP) for high-tier cosmetic enhancements and operational boosts.
                    </p>

                    <div className="xp-display inline-block px-10 py-6 rounded-lg">
                        <div className="text-xs font-mono text-cyan-400/60 tracking-[0.3em] mb-2 uppercase">Available Balance</div>
                        <div className="flex items-center justify-center gap-3">
                            <i className="fas fa-database text-cyan-400 text-2xl animate-pulse"></i>
                            <span id="xpCounter" className="xp-glow text-5xl md:text-6xl font-black">{displayXp.toLocaleString()}</span>
                            <span className="text-xl text-cyan-400/60 font-mono mt-2">XP</span>
                        </div>
                        <div className="w-full h-1 bg-cyan-900/30 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full shadow-[0_0_10px_rgba(0,243,255,0.5)]" style={{ width: '75%' }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-2">
                            <span>INITIATE</span>
                            <span>MAX_YIELD</span>
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    <button className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Gear</button>
                    <button className={`filter-tab ${activeFilter === 'tactical' ? 'active' : ''}`} onClick={() => setActiveFilter('tactical')}>Tactical</button>
                    <button className={`filter-tab ${activeFilter === 'cyber-gear' ? 'active' : ''}`} onClick={() => setActiveFilter('cyber-gear')}>Cyber-Gear</button>
                    <button className={`filter-tab ${activeFilter === 'life-skills' ? 'active' : ''}`} onClick={() => setActiveFilter('life-skills')}>Life-Skills</button>
                    <button className={`filter-tab ${activeFilter === 'interface' ? 'active' : ''}`} onClick={() => setActiveFilter('interface')}>Interface</button>
                    <button className={`filter-tab ${activeFilter === 'neural' ? 'active' : ''}`} onClick={() => setActiveFilter('neural')}>Neural</button>
                </div>

                {/* SHOP GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="shopGrid">
                    {filteredItems.map((item, idx) => {
                        const isOwned = inventory.includes(item.id);
                        const canAfford = userXp >= item.price;
                        const isPurchasing = loading === item.id;

                        return (
                            <div key={item.id} className="item-card rounded-lg animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="item-icon">
                                    <i className={`fas ${item.icon}`}></i>
                                    <div className="absolute top-3 right-3">
                                        <span className={`tag tag-${item.category}`}>{item.catLabel}</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-white font-orbitron mb-2 leading-tight">{item.name}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light h-16">{item.desc}</p>
                                    
                                    <div className="flex items-center justify-between mb-4 pt-4 border-t border-white/5">
                                        <div className="xp-price">
                                            <i className="fas fa-coins text-yellow-400"></i>
                                            <span className="text-2xl font-bold">{item.price}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className={`acquire-btn ${isOwned ? 'owned-btn' : ''}`}
                                        disabled={isOwned || !canAfford || isPurchasing}
                                        onClick={() => handlePurchase(item)}
                                    >
                                        {isOwned ? (
                                            <><i className="fas fa-check"></i> ACQUIRED</>
                                        ) : isPurchasing ? (
                                            <><i className="fas fa-spinner fa-spin"></i> PROCESSING...</>
                                        ) : !canAfford ? (
                                            <><i className="fas fa-lock"></i> INSUFFICIENT XP</>
                                        ) : (
                                            <><i className="fas fa-download"></i> ACQUIRE</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* Toast Notification */}
            <div id="toast" className="fixed bottom-8 right-8 z-[100] translate-y-20 opacity-0 transition-all duration-500 pointer-events-none">
                <div className="px-6 py-4 rounded-lg border border-cyan-500/30 bg-black/80 backdrop-blur text-cyan-400 font-mono text-sm flex items-center gap-3 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                    <i className="fas fa-check-circle text-green-400 text-xl"></i>
                    <span id="toastMsg">{purchaseStatus?.message || 'Item Acquired'}</span>
                </div>
            </div>

        </div>
    );
}
