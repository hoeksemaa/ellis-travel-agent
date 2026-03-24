import * as THREE from "three";

/**
 * A flat surface (table/desk) that receives shadows from objects above it.
 * Invisible material — only shows shadows, not the surface itself.
 */
export default function Surface() {
  return (
    <mesh
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.7, 0]}
    >
      <planeGeometry args={[20, 20]} />
      <shadowMaterial opacity={0.15} color={new THREE.Color("#2a2a2a")} />
    </mesh>
  );
}
