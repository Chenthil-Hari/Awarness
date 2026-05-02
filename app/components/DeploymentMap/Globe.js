'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Globe({ scenarios, onSelect, selectedId }) {
  const globeRef = useRef();

  const points = useMemo(() => {
    return scenarios.map((scenario, i) => {
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
    if (globeRef.current && !selectedId) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={globeRef}>
      <Sphere args={[2, 64, 64]}>
        <MeshDistortMaterial
          color="#0a0a0a"
          roughness={0.1}
          metalness={1}
          distort={0.05}
          speed={2}
        />
      </Sphere>

      <Sphere args={[2.01, 32, 32]}>
        <meshBasicMaterial color="#8b5cf6" wireframe opacity={0.1} transparent />
      </Sphere>

      {points.map((point) => {
        const isSelected = selectedId === point.id;
        return (
          <group key={point.id} position={point.position}>
            <Float speed={isSelected ? 4 : 2} rotationIntensity={isSelected ? 2 : 1} floatIntensity={isSelected ? 2 : 1}>
              <mesh onClick={(e) => {
                e.stopPropagation();
                onSelect(point);
              }}>
                <sphereGeometry args={[isSelected ? 0.12 : 0.06, 16, 16]} />
                <meshBasicMaterial 
                  color={isSelected ? "#fff" : "#8b5cf6"} 
                  transparent 
                  opacity={isSelected ? 1 : 0.6} 
                />
              </mesh>
            </Float>
            
            {/* Pulsing ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08, isSelected ? 0.2 : 0.1, 32]} />
              <meshBasicMaterial color="#8b5cf6" transparent opacity={isSelected ? 0.8 : 0.3} />
            </mesh>
          </group>
        );
      })}

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </group>
  );
}
