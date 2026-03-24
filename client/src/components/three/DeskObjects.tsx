import { Suspense, useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";

import stampUrl from "../../assets/models/Meshy_AI_Wooden_stamp_handle_0323005436_texture.glb";
import pencilUrl from "../../assets/models/Meshy_AI_Golden_Pencil_Across__0323010257_texture.glb";
import penUrl from "../../assets/models/Meshy_AI_Fountain_Pen_0323010542_texture.glb";
import eraserUrl from "../../assets/models/Meshy_AI_Pink_eraser_0323005539_texture.glb";
import passportUrl from "../../assets/models/Meshy_AI_Blue_United_States_Pa_0323215034_texture.glb";

import worldMapUrl from "../../assets/world_map.png";
import camelUrl from "../../assets/backgrounds/camel_desert_bg.png";
import foxForestUrl from "../../assets/backgrounds/fox_forest_bg.png";
import polarBearUrl from "../../assets/backgrounds/polar_bear_arctic.png";
import slothUrl from "../../assets/backgrounds/sloth_tropical.png";

/*
 * Axes (top-down orthographic camera at Y=20):
 *   -X = screen left      +X = screen right
 *   -Z = screen top        +Z = screen bottom
 *   +Y = toward camera     Objects at Y≈0 = flat on XZ desk plane
 *
 * To rotate on the desk surface (XZ plane), we adjust the Z euler angle
 * (since X rotation already laid objects flat). Positive Z rotation = CCW, Negative = CW.
 */

function enableShadows(scene: THREE.Group) {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

// Degree to radian helper
const deg = (d: number) => (d * Math.PI) / 180;

function StampModel() {
  const { scene } = useGLTF(stampUrl, true);
  const groupRef = useRef<THREE.Group>(null);
  enableShadows(scene);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.015;
  });

  return (
    <group
      ref={groupRef}
      position={[-9, 0, 1.5]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[4, 4, 4]}
    >
      <primitive object={scene} />
    </group>
  );
}

function PencilModel() {
  const { scene } = useGLTF(pencilUrl, true);
  enableShadows(scene);

  return (
    <group
      position={[7.5, 0, 1.5]}
      rotation={[Math.PI / 2, 0, -Math.PI / 2 + deg(5)]}
      scale={[4, 4, 4]}
    >
      <primitive object={scene} />
    </group>
  );
}

function PenModel() {
  const { scene } = useGLTF(penUrl, true);
  enableShadows(scene);

  return (
    <group
      position={[9, 0, 1.5]}
      rotation={[Math.PI / 2, 0, -Math.PI / 2 - deg(2)]}
      scale={[4, 4, 4]}
    >
      <primitive object={scene} />
    </group>
  );
}

function EraserModel() {
  const { scene } = useGLTF(eraserUrl, true);
  enableShadows(scene);

  return (
    <group
      position={[11.5, 0, 1.5]}
      rotation={[Math.PI / 2, 0, -Math.PI / 2 - deg(7)]}
      scale={[1.2, 1.2, 1.2]}
    >
      <primitive object={scene} />
    </group>
  );
}

function PassportModel() {
  const { scene } = useGLTF(passportUrl, true);
  enableShadows(scene);

  return (
    <group
      position={[12, 0, -6]}
      rotation={[-Math.PI / 2, 0, deg(-8 + 15)]}
      scale={[4.5, 4.5, 4.5]}
    >
      <primitive object={scene} />
    </group>
  );
}

/*
 * ─── Flat image props on the desk ────────────────────────────────
 * TexturedPlane: a flat plane with a texture, white border, and shadow.
 * Used for world map and mini destination postcards.
 */
function TexturedPlane({
  url,
  position,
  width,
  height,
  rotation = 0,
  border = 0,
}: {
  url: string;
  position: [number, number, number];
  width: number;
  height: number;
  rotation?: number;
  border?: number;
}) {
  const texture = useLoader(TextureLoader, url);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.75,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),
    [texture]
  );

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, rotation]}>
      {border > 0 && (
        <mesh castShadow receiveShadow position={[0, 0, -0.01]}>
          <planeGeometry args={[width + border * 2, height + border * 2]} />
          <meshStandardMaterial color="#faf8f5" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
      <mesh castShadow receiveShadow material={material}>
        <planeGeometry args={[width, height]} />
      </mesh>
    </group>
  );
}

/* Destination postcard dimensions — same size as the hovering postcard (10 x 6.5) */
const CARD_W = 10.0;
const CARD_H = 6.5;
const CARD_BORDER = 0.4;

/* World map — 1376x768 → aspect ~1.79:1, enlarged 4x */
const MAP_W = 28.0;
const MAP_H = MAP_W / (1376 / 768); // ~15.6

useGLTF.preload(stampUrl);
useGLTF.preload(pencilUrl);
useGLTF.preload(penUrl);
useGLTF.preload(eraserUrl);
useGLTF.preload(passportUrl, true);

export default function DeskObjects() {
  return (
    <group>
      <Suspense fallback={null}>
        <StampModel />
      </Suspense>
      <Suspense fallback={null}>
        <PencilModel />
      </Suspense>
      <Suspense fallback={null}>
        <PenModel />
      </Suspense>
      <Suspense fallback={null}>
        <EraserModel />
      </Suspense>
      <Suspense fallback={null}>
        <PassportModel />
      </Suspense>

      {/* World map — far right, only ~1/3 visible on screen */}
      <Suspense fallback={null}>
        <TexturedPlane
          url={worldMapUrl}
          position={[19, 0.01, 8]}
          width={MAP_W}
          height={MAP_H}
          rotation={deg(-3)}
        />
      </Suspense>

      {/* Destination postcards — clustered bottom-left, with two pulled up */}
      {/* Layering order (bottom to top): polar bear (-0.15) → camel (-0.08) → envelope (0) */}
      {/* Polar bear — bottom layer, partially off-screen left */}
      <Suspense fallback={null}>
        <TexturedPlane
          url={polarBearUrl}
          position={[-12, 0.02, -4]}
          width={CARD_W}
          height={CARD_H}
          rotation={deg(8)}
          border={CARD_BORDER}
        />
      </Suspense>
      {/* Camel — on top of polar bear, under the envelope */}
      <Suspense fallback={null}>
        <TexturedPlane
          url={camelUrl}
          position={[-9, 0.06, -7]}
          width={CARD_W}
          height={CARD_H}
          rotation={deg(-15)}
          border={CARD_BORDER}
        />
      </Suspense>
      {/* Sloth tropical — lower layer */}
      <Suspense fallback={null}>
        <TexturedPlane
          url={slothUrl}
          position={[-11, 0.02, 5.7]}
          width={CARD_W}
          height={CARD_H}
          rotation={deg(20)}
          border={CARD_BORDER}
        />
      </Suspense>
      {/* Fox forest — on top of sloth, shifted down toward +Z */}
      <Suspense fallback={null}>
        <TexturedPlane
          url={foxForestUrl}
          position={[-9, 0.1, 7.5]}
          width={CARD_W}
          height={CARD_H}
          rotation={deg(-5)}
          border={CARD_BORDER}
        />
      </Suspense>
    </group>
  );
}
