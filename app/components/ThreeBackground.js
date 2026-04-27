'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function Particles({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50;
      p[i * 3 + 1] = (Math.random() - 0.5) * 50;
      p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, [count]);

  const pointsRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05 + mouse.current.x * 0.1;
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 - mouse.current.y * 0.1;
    }
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingShapes() {
  const groupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere args={[1, 64, 64]} position={[-4, 2, -5]}>
          <MeshDistortMaterial
            color="#ec4899"
            speed={3}
            distort={0.4}
            radius={1}
          />
        </Sphere>
      </Float>

      <Float speed={1.5} rotationIntensity={2} floatIntensity={2}>
        <Sphere args={[1.5, 64, 64]} position={[5, -2, -8]}>
          <MeshDistortMaterial
            color="#06b6d4"
            speed={2}
            distort={0.3}
            radius={1}
          />
        </Sphere>
      </Float>
      
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, -10]}>
          <torusKnotGeometry args={[3, 0.8, 128, 32]} />
          <meshStandardMaterial 
            color="#7c3aed" 
            emissive="#7c3aed" 
            emissiveIntensity={0.5} 
            wireframe 
          />
        </mesh>
      </Float>
    </group>
  );
}

function SceneContent() {
  const cameraRef = useRef();
  
  useEffect(() => {
    // Scroll orchestration
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      }
    });

    if (cameraRef.current) {
      tl.to(cameraRef.current.position, {
        z: 15,
        y: 5,
        x: 2,
        ease: 'none',
      });
      
      tl.to(cameraRef.current.rotation, {
        x: -0.2,
        ease: 'none',
      }, 0);
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 10]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <Particles />
      <FloatingShapes />
      <fog attach="fog" args={['#09090b', 5, 25]} />
    </>
  );
}

export default function ThreeBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: -1,
      pointerEvents: 'none',
      background: '#09090b'
    }}>
      <Canvas dpr={[1, 2]}>
        <SceneContent />
      </Canvas>
    </div>
  );
}
