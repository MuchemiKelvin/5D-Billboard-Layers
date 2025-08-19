import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { WALL_CONFIG } from '@/config/wallConfig';

interface HologramMaterialProps {
  children: React.ReactNode;
}

const HologramMaterial: React.FC<HologramMaterialProps> = ({ children }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float time;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 newPosition = position;
      newPosition.x += sin(position.y * 10.0 + time) * 0.01;
      newPosition.y += cos(position.x * 10.0 + time) * 0.01;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float opacity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = dot(viewDirection, vNormal);
      fresnel = pow(1.0 - fresnel, 2.0);
      
      float wave = sin(vUv.y * 20.0 + time * 2.0) * 0.5 + 0.5;
      float pulse = sin(time * 3.0) * 0.3 + 0.7;
      
      vec3 color = mix(color1, color2, wave);
      float alpha = fresnel * pulse * opacity;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color1: { value: new THREE.Color(0x4ad3ff) },
    color2: { value: new THREE.Color(0x0088ff) },
    opacity: { value: WALL_CONFIG.HOLOGRAM_OPACITY }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      transparent
      depthWrite={false}
    >
      {children}
    </shaderMaterial>
  );
};

interface HologramEffectProps {
  className?: string;
}

export const HologramEffect: React.FC<HologramEffectProps> = ({ className }) => {
  return (
    <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Sphere args={[1.2, 64, 64]}>
          <HologramMaterial>
            <meshStandardMaterial
              color={0x4ad3ff}
              transparent
              opacity={WALL_CONFIG.HOLOGRAM_OPACITY}
            />
          </HologramMaterial>
        </Sphere>
      </Canvas>
    </div>
  );
};
