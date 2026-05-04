'use client';

import { useEffect, useRef } from 'react';

export default function ThreatMapCanvas() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const mapCanvas = canvasRef.current;
    if (!mapCanvas) return;
    const mctx = mapCanvas.getContext('2d');

    // World map dots (simplified lat/lon city clusters)
    const cities = [
      {x:0.13,y:0.42,name:'NY'},{x:0.09,y:0.38,name:'Chicago'},{x:0.07,y:0.45,name:'LA'},
      {x:0.22,y:0.36,name:'London'},{x:0.25,y:0.34,name:'Berlin'},{x:0.27,y:0.38,name:'Moscow'},
      {x:0.28,y:0.33,name:'Stockholm'},{x:0.24,y:0.40,name:'Paris'},
      {x:0.38,y:0.38,name:'Dubai'},{x:0.42,y:0.44,name:'Mumbai'},
      {x:0.52,y:0.38,name:'Delhi'},{x:0.62,y:0.35,name:'Beijing'},
      {x:0.65,y:0.38,name:'Shanghai'},{x:0.68,y:0.43,name:'Tokyo'},
      {x:0.45,y:0.55,name:'Nairobi'},{x:0.23,y:0.55,name:'Lagos'},
      {x:0.15,y:0.62,name:'SãoPaulo'},{x:0.19,y:0.52,name:'Bogotá'},
      {x:0.65,y:0.62,name:'Sydney'},{x:0.56,y:0.45,name:'Singapore'},
      {x:0.50,y:0.42,name:'Islamabad'},{x:0.29,y:0.44,name:'Cairo'},
    ];

    const attacks = [];

    function spawnAttack(){
      const src = cities[Math.floor(Math.random()*cities.length)];
      let dst;
      do { dst = cities[Math.floor(Math.random()*cities.length)]; } while(dst===src);
      attacks.push({
        sx: src.x, sy: src.y, dx: dst.x, dy: dst.y,
        t:0, speed:0.004+Math.random()*0.006,
        color: Math.random()<0.7 ? '#ff2244' : '#ffaa00',
        trail:[],
        done:false
      });
    }

    // Initial spawns
    for(let i=0;i<6;i++) spawnAttack();
    const spawnIv = setInterval(spawnAttack, 900);

    let rafId;

    function drawMap(){
      const W = mapCanvas.width;
      const H = mapCanvas.height;
      mctx.clearRect(0,0,W,H);

      // faint longitude/latitude lines
      mctx.strokeStyle='rgba(0,229,255,0.04)';
      mctx.lineWidth=1;
      for(let i=0;i<=12;i++){
        mctx.beginPath();
        mctx.moveTo(i/12*W,0); mctx.lineTo(i/12*W,H);
        mctx.stroke();
      }
      for(let i=0;i<=8;i++){
        mctx.beginPath();
        mctx.moveTo(0,i/8*H); mctx.lineTo(W,i/8*H);
        mctx.stroke();
      }

      // cities
      cities.forEach(c=>{
        const cx=c.x*W, cy=c.y*H;
        // outer ring
        mctx.strokeStyle='rgba(0,229,255,0.25)';
        mctx.lineWidth=1;
        mctx.beginPath();
        mctx.arc(cx,cy,6,0,Math.PI*2);
        mctx.stroke();
        // dot
        mctx.fillStyle='rgba(0,229,255,0.6)';
        mctx.beginPath();
        mctx.arc(cx,cy,2.5,0,Math.PI*2);
        mctx.fill();
      });

      // attack arcs
      attacks.forEach(a=>{
        if(a.done) return;
        const sx=a.sx*W, sy=a.sy*H, dx=a.dx*W, dy=a.dy*H;
        // control point (arc up)
        const mx=(sx+dx)/2, my=Math.min(sy,dy)-(Math.abs(dx-sx)*0.35);

        a.t = Math.min(a.t+a.speed, 1);

        // bezier point at t
        const px = (1-a.t)*(1-a.t)*sx + 2*(1-a.t)*a.t*mx + a.t*a.t*dx;
        const py = (1-a.t)*(1-a.t)*sy + 2*(1-a.t)*a.t*my + a.t*a.t*dy;

        a.trail.push({x:px,y:py});
        if(a.trail.length>28) a.trail.shift();

        // draw trail
        for(let i=1;i<a.trail.length;i++){
          const alpha = (i/a.trail.length)*0.7;
          mctx.strokeStyle = a.color.replace(')',`,${alpha})`).replace('rgb','rgba').replace('#ff2244',`rgba(255,34,68,${alpha})`).replace('#ffaa00',`rgba(255,170,0,${alpha})`);
          mctx.lineWidth = 1.5;
          mctx.beginPath();
          mctx.moveTo(a.trail[i-1].x, a.trail[i-1].y);
          mctx.lineTo(a.trail[i].x, a.trail[i].y);
          mctx.stroke();
        }

        // head glow
        mctx.shadowBlur=12;
        mctx.shadowColor=a.color;
        mctx.fillStyle=a.color;
        mctx.beginPath();
        mctx.arc(px,py,3,0,Math.PI*2);
        mctx.fill();
        mctx.shadowBlur=0;

        if(a.t>=1){
          // impact pulse
          mctx.strokeStyle=a.color;
          mctx.lineWidth=1.5;
          mctx.globalAlpha=0.8;
          mctx.beginPath();
          mctx.arc(dx,dy,10,0,Math.PI*2);
          mctx.stroke();
          mctx.globalAlpha=1;
          a.done=true;
          setTimeout(()=>{
            const idx = attacks.indexOf(a);
            if (idx !== -1) attacks.splice(idx,1);
          },300);
        }
      });

      rafId = requestAnimationFrame(drawMap);
    }

    function resizeMap(){
      mapCanvas.width=window.innerWidth;
      mapCanvas.height=window.innerHeight;
    }
    resizeMap();
    window.addEventListener('resize',resizeMap);
    drawMap();

    return () => {
      clearInterval(spawnIv);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeMap);
    };
  }, []);

  return <canvas ref={canvasRef} className="mapCanvas"></canvas>;
}
