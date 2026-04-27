'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera, Points, PointMaterial, Text, Center } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// --- Dashboard Node Component ---
const DashboardNode = ({ position, label, color, description, onClick, index }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.cos(t / 4) / 4;
      meshRef.current.rotation.y = Math.sin(t / 4) / 4;
      meshRef.current.position.y = position[1] + Math.sin(t + index) * 0.2;
    }
  });

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh 
          ref={meshRef} 
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
        >
          <sphereGeometry args={[1.2, 64, 64]} />
          <MeshDistortMaterial
            color={hovered ? '#ffffff' : color}
            speed={2}
            distort={0.4}
            radius={1}
            emissive={color}
            emissiveIntensity={hovered ? 2 : 0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Label */}
      <Center top position={[0, 2, 0]}>
        <Text
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight={900}
        >
          {label.toUpperCase()}
        </Text>
      </Center>

      {/* Glow Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.6, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// --- Dashboard Scene Content ---
const DashboardScene = ({ scrollProgress }) => {
  const { camera } = useThree();
  const groupRef = useRef();

  // Nodes Data
  const nodes = [
    { 
      id: 'survival', 
      label: 'Survival', 
      color: '#ef4444', 
      position: [0, 0, 0],
      description: 'The Gauntlet: 100 Players, 1 Winner'
    },
    { 
      id: 'heist', 
      label: 'The Heist', 
      color: '#06b6d4', 
      position: [8, -4, -12],
      description: 'Co-op Tactical Infiltration'
    },
    { 
      id: 'duels', 
      label: 'Duels', 
      color: '#8b5cf6', 
      position: [-8, 3, -20],
      description: '1v1 Knowledge Battles'
    }
  ];

  useFrame(() => {
    // Smoothly animate camera based on scroll progress
    const targetZ = 12 - scrollProgress * 30;
    const targetX = Math.sin(scrollProgress * Math.PI) * 8;
    const targetY = -scrollProgress * 4;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    
    // Look slightly towards the center of activity
    camera.lookAt(0, -scrollProgress * 2, -scrollProgress * 8);
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <DashboardNode key={node.id} {...node} index={i} />
      ))}
      
      {/* Connector Lines */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0,0,0),
          new THREE.Vector3(8,-4,-12),
          new THREE.Vector3(-8,3,-20)
        ])} />
        <lineBasicMaterial attach="material" color="#ffffff" transparent opacity={0.15} />
      </line>
    </group>
  );
};

function Particles({ count = 5000, color = "#ff0000", speed = 1 }) {
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
      pointsRef.current.rotation.y = time * 0.05 * speed + mouse.current.x * 0.1;
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 - mouse.current.y * 0.1;
    }
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.4}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingShapes({ primaryColor = "#ec4899", secondaryColor = "#06b6d4", accentColor = "#7c3aed", intensity = 1 }) {
  const groupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1 * intensity;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2 * intensity} rotationIntensity={1} floatIntensity={1}>
        <Sphere args={[1, 64, 64]} position={[-4, 2, -5]}>
          <MeshDistortMaterial
            color={primaryColor}
            speed={3 * intensity}
            distort={0.4}
            radius={1}
          />
        </Sphere>
      </Float>

      <Float speed={1.5 * intensity} rotationIntensity={2} floatIntensity={2}>
        <Sphere args={[1.5, 64, 64]} position={[5, -2, -8]}>
          <MeshDistortMaterial
            color={secondaryColor}
            speed={2 * intensity}
            distort={0.3}
            radius={1}
          />
        </Sphere>
      </Float>
      
      <Float speed={3 * intensity} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, -10]}>
          <torusKnotGeometry args={[3, 0.8, 128, 32]} />
          <meshStandardMaterial 
            color={accentColor} 
            emissive={accentColor} 
            emissiveIntensity={0.5 * intensity} 
            wireframe 
          />
        </mesh>
      </Float>
    </group>
  );
}

function SceneContent({ theme = 'default', speed = 1, intensity = 1, shake = 0 }) {
  const cameraRef = useRef();
  
  const colors = useMemo(() => {
    if (theme === 'danger') {
      return {
        particles: '#ff0000',
        primary: '#ff4d4d',
        secondary: '#ff0000',
        accent: '#ff0000',
        fog: '#050101'
      };
    }
    return {
      particles: '#8b5cf6',
      primary: '#ec4899',
      secondary: '#06b6d4',
      accent: '#7c3aed',
      fog: '#09090b'
    };
  }, [theme]);

  useFrame((state) => {
    if (cameraRef.current && shake > 0) {
      cameraRef.current.position.x += (Math.random() - 0.5) * shake;
      cameraRef.current.position.y += (Math.random() - 0.5) * shake;
    }
  });

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
      <ambientLight intensity={1 * intensity} />
      <pointLight position={[10, 10, 10]} intensity={2 * intensity} color={colors.primary} />
      <pointLight position={[-10, -10, -10]} intensity={1 * intensity} color={colors.secondary} />
      <Particles color={colors.particles} speed={speed} />
      <FloatingShapes primaryColor={colors.primary} secondaryColor={colors.secondary} accentColor={colors.accent} intensity={intensity} />
      <fog attach="fog" args={[colors.fog, 5, 25]} />
    </>
  );
}

export default function ThreeBackground({ 
  theme = 'default', 
  speed = 1, 
  intensity = 1, 
  shake = 0,
  mode = 'arena',
  scrollProgress = 0
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: 0,
      pointerEvents: mode === 'dashboard' ? 'auto' : 'none', // Enable interaction in dashboard
      transition: 'background 1s ease-in-out',
      background: theme === 'danger' ? '#050101' : '#09090b'
    }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 50 }}>
        {mode === 'dashboard' ? (
          <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
            <Particles color="#4a4a4a" speed={0.5} count={4000} />
            <DashboardScene scrollProgress={scrollProgress} />
          </>
        ) : (
          <SceneContent theme={theme} speed={speed} intensity={intensity} shake={shake} />
        )}
      </Canvas>
    </div>
  );
}
