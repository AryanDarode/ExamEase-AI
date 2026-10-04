import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Color palette matching the app: Teal (#14B8A6 / #2DD4BF), Cyan (#38BDF8), Deep Navy & Indigo (#6366F1 / #0F766E)
const PALETTE = [
  '#14B8A6', // primary teal
  '#2DD4BF', // bright teal
  '#38BDF8', // sky cyan
  '#0F766E', // deep teal
  '#818CF8', // soft indigo
  '#5EEAD4', // aqua
];

// Single floating geometric polyhedron
function FloatingPolyhedron({ initialPos, speed, rotSpeed, scale, color, geoType }) {
  const meshRef = useRef();
  const wireRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Gentle upward drift with smooth looping
    meshRef.current.position.y = initialPos[1] + Math.sin(time * speed.y + initialPos[0]) * 0.8;
    meshRef.current.position.x = initialPos[0] + Math.cos(time * speed.x + initialPos[1]) * 0.4;
    meshRef.current.position.z = initialPos[2] + Math.sin(time * speed.z) * 0.3;

    // Slow 3-axis continuous rotation
    meshRef.current.rotation.x += delta * rotSpeed.x;
    meshRef.current.rotation.y += delta * rotSpeed.y;
    meshRef.current.rotation.z += delta * rotSpeed.z;

    if (wireRef.current) {
      wireRef.current.rotation.x = meshRef.current.rotation.x;
      wireRef.current.rotation.y = meshRef.current.rotation.y;
      wireRef.current.rotation.z = meshRef.current.rotation.z;
      wireRef.current.position.copy(meshRef.current.position);
    }
  });

  const renderGeometry = () => {
    switch (geoType) {
      case 'icosahedron':
        return <icosahedronGeometry args={[scale, 0]} />;
      case 'octahedron':
        return <octahedronGeometry args={[scale, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[scale, 0]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[scale, 0]} />;
      default:
        return <icosahedronGeometry args={[scale, 1]} />;
    }
  };

  return (
    <group>
      {/* Semi-transparent filled solid core */}
      <mesh ref={meshRef} position={initialPos}>
        {renderGeometry()}
        <meshPhysicalMaterial
          color={color}
          roughness={0.25}
          metalness={0.1}
          transmission={0.6}
          thickness={0.8}
          transparent={true}
          opacity={0.45}
          reflectivity={0.5}
          clearcoat={0.3}
        />
      </mesh>

      {/* Subtle outer wireframe edge glow */}
      <mesh ref={wireRef} position={initialPos}>
        {renderGeometry()}
        <meshBasicMaterial
          color={color}
          wireframe={true}
          transparent={true}
          opacity={0.28}
        />
      </mesh>
    </group>
  );
}

// Drifting micro-particle dust / star field
function AmbientParticleField({ count = 350 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    const colorTeal = new THREE.Color('#2DD4BF');
    const colorCyan = new THREE.Color('#38BDF8');
    const colorWhite = new THREE.Color('#E2E8F0');
    const colorIndigo = new THREE.Color('#818CF8');

    for (let i = 0; i < count; i++) {
      // Pure deterministic spread across wide 3D volume
      const r1 = Math.sin(i * 12.9898) * 43758.5453;
      const f1 = r1 - Math.floor(r1);
      const r2 = Math.sin((i + 1) * 78.233) * 43758.5453;
      const f2 = r2 - Math.floor(r2);
      const r3 = Math.sin((i + 2) * 45.164) * 43758.5453;
      const f3 = r3 - Math.floor(r3);

      pos[i * 3] = (f1 - 0.5) * 32;
      pos[i * 3 + 1] = (f2 - 0.5) * 26;
      pos[i * 3 + 2] = (f3 - 0.5) * 18;

      // Color variation
      let chosenColor = colorTeal;
      if (f1 < 0.35) chosenColor = colorTeal;
      else if (f1 < 0.65) chosenColor = colorCyan;
      else if (f1 < 0.85) chosenColor = colorIndigo;
      else chosenColor = colorWhite;

      cols[i * 3] = chosenColor.r;
      cols[i * 3 + 1] = chosenColor.g;
      cols[i * 3 + 2] = chosenColor.b;
    }

    return [pos, cols];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();

    // Very gentle particle drift
    pointsRef.current.rotation.y = time * 0.015;
    pointsRef.current.rotation.x = Math.sin(time * 0.01) * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors={true}
        transparent={true}
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Subtle perspective horizon grid plane at bottom
function HorizonGrid() {
  const gridRef = useRef();

  useFrame((state) => {
    if (!gridRef.current) return;
    const time = state.clock.getElapsedTime();
    // Very subtle rhythmic pulse in opacity
    if (gridRef.current.material) {
      gridRef.current.material.opacity = 0.12 + Math.sin(time * 0.5) * 0.03;
    }
  });

  return (
    <group position={[0, -6.5, -4]} rotation={[-Math.PI / 2.3, 0, 0]}>
      <gridHelper
        ref={gridRef}
        args={[36, 24, '#14B8A6', '#0F3738']}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial
          attach="material"
          color="#14B8A6"
          wireframe={true}
          transparent={true}
          opacity={0.14}
        />
      </gridHelper>
    </group>
  );
}

// Camera controller with smooth subtle mouse parallax
function CameraRig() {
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse.current.targetX = x * 0.4;
      mouse.current.targetY = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    // Smooth damping
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.03;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.03;

    state.camera.position.x = mouse.current.x;
    state.camera.position.y = mouse.current.y;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main 3D Canvas Scene
export default function AnimatedBackgroundScene() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  // Pause rendering when tab is not visible (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Predefined calm polyhedrons placed harmoniously
  const polyhedrons = useMemo(
    () => [
      {
        initialPos: [-5.2, 2.5, -3.5],
        speed: { x: 0.2, y: 0.25, z: 0.15 },
        rotSpeed: { x: 0.08, y: 0.12, z: 0.06 },
        scale: 1.4,
        color: PALETTE[0], // #14B8A6
        geoType: 'icosahedron',
      },
      {
        initialPos: [5.6, 3.2, -4.0],
        speed: { x: 0.18, y: 0.22, z: 0.12 },
        rotSpeed: { x: 0.06, y: -0.1, z: 0.08 },
        scale: 1.6,
        color: PALETTE[1], // #2DD4BF
        geoType: 'dodecahedron',
      },
      {
        initialPos: [-4.5, -3.0, -2.8],
        speed: { x: 0.15, y: 0.18, z: 0.2 },
        rotSpeed: { x: -0.09, y: 0.07, z: 0.05 },
        scale: 1.1,
        color: PALETTE[2], // #38BDF8
        geoType: 'octahedron',
      },
      {
        initialPos: [4.8, -2.6, -3.0],
        speed: { x: 0.22, y: 0.28, z: 0.14 },
        rotSpeed: { x: 0.1, y: 0.09, z: -0.07 },
        scale: 1.25,
        color: PALETTE[4], // #818CF8
        geoType: 'icosahedron',
      },
      {
        initialPos: [-1.8, 4.2, -5.5],
        speed: { x: 0.12, y: 0.16, z: 0.1 },
        rotSpeed: { x: 0.05, y: 0.08, z: 0.04 },
        scale: 0.9,
        color: PALETTE[5], // #5EEAD4
        geoType: 'octahedron',
      },
      {
        initialPos: [2.2, -4.5, -4.8],
        speed: { x: 0.14, y: 0.2, z: 0.12 },
        rotSpeed: { x: -0.07, y: -0.06, z: 0.08 },
        scale: 1.0,
        color: PALETTE[3], // #0F766E
        geoType: 'tetrahedron',
      },
      {
        initialPos: [0.2, 3.6, -6.0],
        speed: { x: 0.1, y: 0.14, z: 0.08 },
        rotSpeed: { x: 0.04, y: 0.06, z: 0.05 },
        scale: 0.75,
        color: PALETTE[1],
        geoType: 'icosahedron',
      },
    ],
    []
  );

  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 45, near: 0.1, far: 50 }}
      dpr={[1, 1.5]}
      frameloop={isVisible ? 'always' : 'never'}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {/* Atmosphere Fog for calm depth */}
      <fog attach="fog" args={['#080c18', 8, 26]} />

      {/* Subtle Ambient & Colored Lights */}
      <ambientLight color="#0f172a" intensity={0.9} />
      <directionalLight position={[6, 8, 5]} color="#2dd4bf" intensity={2.2} />
      <directionalLight position={[-6, -6, 4]} color="#6366f1" intensity={1.8} />
      <pointLight position={[0, 3, 2]} color="#38bdf8" intensity={1.2} distance={15} />

      {/* 3D Scene Components */}
      <CameraRig />
      <HorizonGrid />
      <AmbientParticleField count={300} />

      {polyhedrons.map((p, idx) => (
        <FloatingPolyhedron key={idx} {...p} />
      ))}
    </Canvas>
  );
}
