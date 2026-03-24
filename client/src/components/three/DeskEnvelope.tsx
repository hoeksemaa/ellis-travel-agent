import { useRef, useState, useCallback, useMemo, Suspense } from "react";
import { useFrame, useLoader, ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import envelopeUrl from "../../assets/models/Meshy_AI_cream_envelope_with_r_0323012924_texture.glb";
import postcardImageUrl from "../../assets/bg-landscape.png";

/*
 * ─── Physics Parameters (tunable) ────────────────────────────────
 * See docs/phase-plan.md for full tuning guide.
 */
const PHYSICS = {
  friction: 2.5,
  damping: 1.2,        // higher = settles faster, fewer oscillations
  frequency: 5.0,      // lower = gentler oscillation
  overshootAmplitude: 0.1, // reduced overshoot for smoother settle
  tiltAngle: 8,
  floatHeight: 1.2,
  settleHeight: 0.15,
  animationDuration: 2.8, // slightly longer for smoother feel
};

const TILT_RAD = (PHYSICS.tiltAngle * Math.PI) / 180;

// Postcard starts top-right, same as the old envelope position
const START_POS = new THREE.Vector3(5.0, PHYSICS.floatHeight, -10.2);
const END_POS = new THREE.Vector3(0, PHYSICS.settleHeight, 0);

// Postcard dimensions — 2:1 aspect ratio matching bg-landscape.png (1200x600)
// Sized slightly smaller than the envelope (which was ~11.4 x 7.4)
const POSTCARD_HEIGHT = 6.5;   // vertical on screen (group local X after Ry rotation)
const POSTCARD_WIDTH = 10.0;   // horizontal on screen (group local Z)

type Phase = "idle" | "sliding" | "arrived" | "done";

interface Props {
  animating: boolean;
  onClick: () => void;
  onArrived: () => void;
  onHoverChange?: (hovered: boolean) => void;
  onPostcardReady?: () => void;
}

/*
 * ─── Static envelope decoration ──────────────────────────────────
 * Placed in the top-left corner (-X, -Z) partially off-screen.
 * Non-interactive — just desk set dressing.
 */
function StaticEnvelope() {
  const { scene } = useGLTF(envelopeUrl, true);

  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[-6, 0, -9.5]}
      scale={[6, 6, 6]}
      rotation={[-Math.PI / 2, 0, -(255 * Math.PI / 180)]}
    />
  );
}

/*
 * ─── Interactive postcard ────────────────────────────────────────
 * Flat plane with the fox meadow texture.
 * Hover, click, and slide physics — same as the old envelope.
 */
function PostcardMesh({
  onPointerEnter,
  onPointerLeave,
  onClick,
}: {
  onPointerEnter: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave: () => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const postcardTexture = useLoader(TextureLoader, postcardImageUrl);

  // Rotate texture so landscape image maps correctly after mesh rotation
  useMemo(() => {
    postcardTexture.center.set(0.5, 0.5);
    postcardTexture.rotation = Math.PI / 2;
  }, [postcardTexture]);

  const postcardMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: postcardTexture,
        roughness: 0.7,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),
    [postcardTexture]
  );

  const BORDER = 0.4; // white border width around the image

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* White card backing — slightly larger than the image */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, -0.01]}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        <planeGeometry args={[POSTCARD_HEIGHT + BORDER * 2, POSTCARD_WIDTH + BORDER * 2]} />
        <meshStandardMaterial color="#faf8f5" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Postcard image on top of the white backing */}
      <mesh
        material={postcardMaterial}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        <planeGeometry args={[POSTCARD_HEIGHT, POSTCARD_WIDTH]} />
      </mesh>
    </group>
  );
}

/* Fallback postcard without texture (renders if texture Suspense hangs) */
function PostcardFallback({
  onPointerEnter,
  onPointerLeave,
  onClick,
}: {
  onPointerEnter: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave: () => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const BORDER = 0.4;
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh
        castShadow
        receiveShadow
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        <planeGeometry args={[POSTCARD_HEIGHT + BORDER * 2, POSTCARD_WIDTH + BORDER * 2]} />
        <meshStandardMaterial color="#faf8f5" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[POSTCARD_HEIGHT, POSTCARD_WIDTH]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

useGLTF.preload(envelopeUrl, true);

export default function DeskEnvelope({
  animating,
  onClick,
  onArrived,
  onHoverChange,
  onPostcardReady,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const animStartTime = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");

  const startYRotation = 0;
  const endYRotation = -Math.PI / 2;

  const handlePointerEnter = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (animating || phase !== "idle") return;
      e.stopPropagation();
      setHovered(true);
      onHoverChange?.(true);
      document.body.style.cursor = "pointer";
    },
    [animating, phase, onHoverChange]
  );

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    onHoverChange?.(false);
    document.body.style.cursor = "default";
  }, [onHoverChange]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (phase !== "idle") return;
      e.stopPropagation();
      setHovered(false);
      onHoverChange?.(false);
      document.body.style.cursor = "default";
      onClick();
    },
    [onClick, phase, onHoverChange]
  );

  useFrame((state) => {
    if (!groupRef.current) return;

    // ─── Idle: postcard in top-right corner, floating ───
    if (!animating && phase === "idle") {
      const targetZ = hovered ? START_POS.z + 0.8 : START_POS.z;
      const currentZ = groupRef.current.position.z;
      const lerpedZ = currentZ + (targetZ - currentZ) * 0.08;
      groupRef.current.position.set(START_POS.x, START_POS.y, lerpedZ);
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = START_POS.y + Math.sin(t * 0.6) * 0.04;
      groupRef.current.rotation.set(0, startYRotation, 0);
      return;
    }

    // ─── Sliding to center ───
    if (animating && (phase === "idle" || phase === "sliding")) {
      if (phase === "idle") setPhase("sliding");

      if (animStartTime.current === null) {
        animStartTime.current = state.clock.elapsedTime;
      }

      const elapsed = state.clock.elapsedTime - animStartTime.current;
      const duration = PHYSICS.animationDuration;
      const t = Math.min(elapsed / duration, 1);

      const frictionProgress = 1 - Math.exp(-PHYSICS.friction * t * 3);
      const baseX = START_POS.x + (END_POS.x - START_POS.x) * frictionProgress;
      const baseZ = START_POS.z + (END_POS.z - START_POS.z) * frictionProgress;

      const heightProgress = 1 - Math.exp(-3 * t);
      const currentHeight =
        PHYSICS.floatHeight + (PHYSICS.settleHeight - PHYSICS.floatHeight) * heightProgress;

      groupRef.current.position.set(baseX, currentHeight, baseZ);

      // Smooth ease-out for rotation — no snap at the end
      const rotEased = 1 - Math.pow(1 - t, 3);
      const currentYRot = startYRotation + (endYRotation - startYRotation) * rotEased;
      const currentZTilt = TILT_RAD * (1 - rotEased);

      groupRef.current.rotation.set(0, currentYRot, currentZTilt);

      if (t >= 1 && phase === "sliding") {
        groupRef.current.position.copy(END_POS);
        groupRef.current.rotation.set(0, endYRotation, 0);
        setPhase("arrived");
        onArrived();
        // Fire postcard ready immediately — no opening animation needed
        onPostcardReady?.();
      }
      return;
    }
  });

  return (
    <>
      {/* Static envelope as desk decoration — top-left, partially off-screen */}
      <Suspense fallback={null}>
        <StaticEnvelope />
      </Suspense>

      {/* Interactive postcard — hover, click, slide to center */}
      <group ref={groupRef} position={START_POS.toArray()} rotation={[0, 0, 0]}>
        <Suspense fallback={
          <PostcardFallback
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
          />
        }>
          <PostcardMesh
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
          />
        </Suspense>
      </group>
    </>
  );
}
