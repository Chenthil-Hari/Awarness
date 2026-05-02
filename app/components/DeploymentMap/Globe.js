'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Globe({ scenarios, onSelect }) {
  const globeRef = useRef();

  // Create points on the globe for each scenario
  const points = useMemo(() => {
    return scenarios.map((scenario, i) => {
      // Generate pseudo-random but stable coordinates based on ID
      const seed = scenario.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const phi = Math.acos(-1 + (2 * i) / scenarios.length);
      const theta = Math.sqrt(scenarios.length * Math.PI) * phi + seed;
      
      const radius = 2.05;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      return { ...scenario, position: [x, y, z] };
    });
  }, [scenarios]);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={globeRef}>
      {/* The Globe Core */}
      <Sphere args={[2, 64, 64]}>
        <MeshDistortMaterial
          color="#0a0a0a"
          roughness={0.1}
          metalness={1}
          distort={0.1}
          speed={2}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[2.01, 32, 32]}>
        <meshBasicMaterial color="#8b5cf6" wireframe opacity={0.1} transparent />
      </Sphere>

      {/* Infection Points */}
      {points.map((point) => (
        <group key={point.id} position={point.position}>
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh onClick={(e) => {
              e.stopPropagation();
              onSelect(point);
            }}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#8b5cf6" />
              <Html distanceFactor={10}>
                <div className="globe-label" onClick={() => onSelect(point)}>
                  <div className="label-dot" />
                  <span className="label-text">{point.title}</span>
                </div>
              </Html>
            </mesh>
          </Float>
          
          {/* Pulsing ring around point */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.12, 32]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </group>
  );
}
