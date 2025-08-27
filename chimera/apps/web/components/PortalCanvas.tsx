'use client';
import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

const PortalSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const [shouldBloom, setShouldBloom] = useState(false);

  useEffect(() => {
    const handleInsight = () => {
      setShouldBloom(true);
      setTimeout(() => setShouldBloom(false), 500);
    };
    document.addEventListener("assistant-insight", handleInsight);
    return () => document.removeEventListener("assistant-insight", handleInsight);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x += delta * 0.05;
    }
    if (materialRef.current) {
        materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, shouldBloom ? 5.0 : 0.0, delta * 10);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]}>
      <meshStandardMaterial ref={materialRef} color="royalblue" wireframe emissive="royalblue" emissiveIntensity={0} />
    </Sphere>
  );
};

export const PortalCanvas = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -1 }}>
      <Canvas>
        <ambientLight intensity={0.1} />
        <directionalLight color="red" position={[0, 0, 5]} />
        <PortalSphere />
      </Canvas>
    </div>
  );
};
