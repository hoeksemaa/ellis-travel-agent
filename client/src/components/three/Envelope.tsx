import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";
import cardTextureUrl from "../../assets/card-texture.png";

/**
 * 3D Envelope mesh — a flat rectangular body with a triangular flap.
 * Uses the paper texture from the existing card-texture asset.
 * Casts shadows and responds to scene lighting.
 */
export default function Envelope() {
  const groupRef = useRef<THREE.Group>(null);

  // Load the paper texture
  const paperTexture = useLoader(TextureLoader, cardTextureUrl);
  paperTexture.wrapS = paperTexture.wrapT = THREE.RepeatWrapping;

  // Paper material — slightly rough, warm tint
  const paperMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: paperTexture,
        color: "#f5f0e8",
        roughness: 0.85,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),
    [paperTexture]
  );

  // Envelope dimensions (in world units)
  const width = 5.0;
  const height = 3.2;
  const thickness = 0.06;
  const flapHeight = 1.8;

  // Flap geometry — triangle
  const flapShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(0, flapHeight);
    shape.lineTo(width / 2, 0);
    shape.closePath();
    return shape;
  }, []);

  const flapGeometry = useMemo(
    () => new THREE.ShapeGeometry(flapShape),
    [flapShape]
  );

  // Subtle idle breathing — gentle float
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.03;
  });

  return (
    <group ref={groupRef}>
      {/* Envelope body — flat box */}
      <mesh castShadow receiveShadow material={paperMaterial}>
        <boxGeometry args={[width, height, thickness]} />
      </mesh>

      {/* Flap — triangle on top edge, slightly tilted back (closed) */}
      <mesh
        castShadow
        material={paperMaterial}
        position={[0, height / 2, 0]}
        rotation={[Math.PI * 0.02, 0, 0]}
        geometry={flapGeometry}
      />

      {/* Seal dot — dark green circle where the flap meets the body */}
      <mesh position={[0, height / 2 + 0.1, thickness / 2 + 0.01]}>
        <circleGeometry args={[0.25, 32]} />
        <meshStandardMaterial color="#344a37" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}
