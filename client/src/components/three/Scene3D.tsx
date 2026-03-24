import { Canvas } from "@react-three/fiber";
import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable R3F canvas wrapper with warm directional lighting and shadows.
 * Renders as a full-size layer — parent must handle CSS positioning/layering.
 */
export default function Scene3D({ children, className }: Props) {
  return (
    <Canvas
      className={className}
      shadows
      camera={{ position: [0, 5, 10], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Warm ambient fill */}
      <ambientLight intensity={0.4} color="#fff5e6" />

      {/* Main directional light — warm, casting shadows */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Subtle fill from opposite side */}
      <directionalLight
        position={[-3, 4, -2]}
        intensity={0.3}
        color="#e8dfd4"
      />

      {children}
    </Canvas>
  );
}
