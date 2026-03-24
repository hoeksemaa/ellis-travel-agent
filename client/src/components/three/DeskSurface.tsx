import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import woodTextureUrl from "../../assets/backgrounds/natural-wood-texture-background-surface-of-teak-wooden-desk-texture-free-photo.jpg";

/**
 * Wooden desk surface with real wood texture.
 * Oversized plane to fill viewport at any aspect ratio.
 */
export default function DeskSurface() {
  const woodTexture = useLoader(TextureLoader, woodTextureUrl);
  woodTexture.wrapS = woodTexture.wrapT = THREE.ClampToEdgeWrapping;
  woodTexture.repeat.set(1, 1);

  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.7,
        metalness: 0.0,
      }),
    [woodTexture]
  );

  return (
    <mesh
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      material={woodMaterial}
    >
      <planeGeometry args={[60, 40]} />
    </mesh>
  );
}
