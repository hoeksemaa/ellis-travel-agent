import { Suspense, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import DeskSurface from "./DeskSurface";
import DeskEnvelope from "./DeskEnvelope";
import DeskObjects from "./DeskObjects";
import cardTextureUrl from "../../assets/card-texture.png";
import postmarkUrl from "../../assets/postcard_stamp.png";
import postageSticker from "../../assets/postage_sticker.png";

interface Props {
  onSceneReady?: () => void;
  onEnvelopeClicked?: () => void;
  onEnvelopeArrived: () => void;
  onEnvelopeHover?: (hovered: boolean) => void;
  onPostcardReady?: () => void;
  postcardClicked?: boolean;
}

const ZOOM_DURATION = 2.5; // seconds for the dolly zoom
const ZOOM_START = 70;     // starting orthographic zoom
const ZOOM_END = 350;      // final zoom — very close to postcard surface
const ZOOM_PAUSE = 0.1;    // pause after postcard settles before zoom starts
const FLASH_AT = 0.1;      // start the flash 1s into the zoom

/**
 * Animates the orthographic camera zoom toward the postcard center.
 * Fires onComplete near the end of the zoom (at FLASH_AT seconds)
 * so the white flash overlaps with the final zoom frames.
 */
function CameraZoom({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete: () => void;
}) {
  const { camera } = useThree();
  const startTimeRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  useFrame((state) => {
    if (!active) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime + ZOOM_PAUSE;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    if (elapsed < 0) return; // still in pause

    const t = Math.min(elapsed / ZOOM_DURATION, 1);
    const eased = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;

    (camera as any).zoom = ZOOM_START + (ZOOM_END - ZOOM_START) * eased;
    camera.updateProjectionMatrix();

    // Fire transition near the end of the zoom, not after
    if (elapsed >= FLASH_AT && !firedRef.current) {
      firedRef.current = true;
      onComplete();
    }
  });

  return null;
}

const deg = (d: number) => (d * Math.PI) / 180;

/**
 * 3D postcard back — a textured plane in the scene that receives
 * the same lighting as everything else. Text rendered via Html overlay.
 */
function PostcardBack({ visible }: { visible: boolean }) {
  const texture = useLoader(TextureLoader, cardTextureUrl);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),
    [texture]
  );

  // Card dimensions — roughly 10.5 x 6.5 (slightly wider than tall, postcard proportions)
  const cardW = 10.5;
  const cardH = 6.8;

  if (!visible) return null;

  return (
    <group position={[-0.5, 0.3, 0.8]} rotation={[-Math.PI / 2, 0, deg(-8)]}>
      <mesh castShadow receiveShadow material={material}>
        <planeGeometry args={[cardW, cardH]} />
      </mesh>

      {/* Text overlay — rendered as HTML but positioned in 3D space */}
      <Html
        transform
        occlude={false}
        position={[0, 0, 0.01]}
        rotation={[0, 0, 0]}
        distanceFactor={5.5}
        style={{
          width: "700px",
          height: "450px",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div style={{
          width: "700px",
          height: "450px",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Dancing Script', cursive",
          color: "#2a2018",
          position: "relative",
        }}>
          {/* Header — app name */}
          <div style={{
            textAlign: "center",
            padding: "16px 0 8px",
            borderBottom: "2px solid #8a7d6d",
            margin: "0 24px",
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'Domine', serif",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: "#b54a2e",
            }}>BON VOYAGE</span>
          </div>

          {/* Body — message left, address right */}
          <div style={{
            flex: 1,
            display: "flex",
            position: "relative",
          }}>
            {/* Vertical divider line */}
            <div style={{
              position: "absolute",
              left: "55%",
              top: "4%",
              bottom: "4%",
              width: "2px",
              background: "#8a7d6d",
            }} />

            {/* Left — return address + message */}
            <div style={{
              flex: "0 0 55%",
              padding: "14px 24px 24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}>
              {/* Return address */}
              <div style={{
                fontSize: "13px",
                fontFamily: "'Domine', serif",
                color: "#8b7d6b",
                lineHeight: 1.5,
                marginBottom: "4px",
              }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#5a4e3e" }}>Bon Voyage Travel Co.</p>
                <p style={{ margin: 0 }}>42 Wanderlust Lane</p>
                <p style={{ margin: 0 }}>Somewhere Beautiful, Earth 00001</p>
              </div>

              {/* Message */}
              <p style={{ fontSize: "38px", fontWeight: 700, margin: 0, marginTop: "20px" }}>Dear Adventurer,</p>
              <p style={{ fontSize: "22px", lineHeight: 1.55, color: "#3d3022", margin: 0 }}>
                Tired of the endless group chat debates?
                Just tell us your travel dreams — we'll plan the
                perfect trip for your crew.
              </p>
              <p style={{ fontSize: "20px", color: "#6b5d4d", fontStyle: "italic", margin: 0 }}>
                — Bon Voyage
              </p>
            </div>

            {/* Right — stamp area + postmark + address */}
            <div style={{
              flex: "0 0 45%",
              padding: "14px 32px 24px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            }}>
              {/* Stamp placeholder + postmark overlay */}
              <div style={{
                alignSelf: "flex-end",
                position: "relative",
                width: "140px",
                height: "100px",
              }}>
                {/* Postage sticker */}
                <img
                  src={postageSticker}
                  alt=""
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "110px",
                    height: "auto",
                    borderRadius: "2px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                />

                {/* Postmark overlapping stamp area */}
                <img
                  src={postmarkUrl}
                  alt=""
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-20px",
                    width: "140px",
                    height: "auto",
                    opacity: 0.7,
                    transform: "rotate(-8deg)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Address lines */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{
                  fontFamily: "'Domine', serif",
                  fontSize: "18px",
                  color: "#8b7d6b",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  margin: 0,
                }}>TO:</p>
                <p style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  borderBottom: "2px solid #8a7d6d",
                  paddingBottom: "6px",
                  margin: 0,
                }}>You &amp; Your Friends</p>
                <p style={{
                  fontSize: "22px",
                  color: "#5a4e3e",
                  borderBottom: "2px solid #8a7d6d",
                  paddingBottom: "6px",
                  margin: 0,
                }}>Wherever You Dream Of</p>
                <p style={{
                  fontSize: "22px",
                  color: "#5a4e3e",
                  borderBottom: "2px solid #8a7d6d",
                  paddingBottom: "6px",
                  margin: 0,
                }}>The World</p>
                {/* Empty address lines */}
                <div style={{ borderBottom: "2px solid #a09384", height: "1px", marginTop: "8px" }} />
                <div style={{ borderBottom: "2px solid #a09384", height: "1px", marginTop: "8px" }} />
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

/** Tracks loading of sub-components and fires onSceneReady when all done */
function LoadTracker({
  onReady,
  children,
}: {
  onReady: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    // This component only renders once Suspense resolves (all children loaded)
    onReady();
  }, [onReady]);

  return <>{children}</>;
}

export default function DeskScene({
  onSceneReady,
  onEnvelopeClicked,
  onEnvelopeArrived,
  onEnvelopeHover,
  onPostcardReady,
  postcardClicked,
}: Props) {
  const [animating, setAnimating] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [surfaceLoaded, setSurfaceLoaded] = useState(false);
  const [objectsLoaded, setObjectsLoaded] = useState(false);

  const handleSurfaceLoaded = useCallback(() => setSurfaceLoaded(true), []);
  const handleObjectsLoaded = useCallback(() => setObjectsLoaded(true), []);

  // Fire sceneReady when both surface and objects are loaded
  useEffect(() => {
    if (surfaceLoaded && objectsLoaded) {
      onSceneReady?.();
    }
  }, [surfaceLoaded, objectsLoaded, onSceneReady]);

  const handleEnvelopeClick = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    onEnvelopeClicked?.();
  }, [animating, onEnvelopeClicked]);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <Canvas
        shadows
        orthographic
        dpr={[1, 1.5]}
        camera={{
          position: [0, 20, 0],
          zoom: 70,
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#b5905a" }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
        }}
      >
        <ambientLight intensity={0.5} color="#fff5e6" />
        <directionalLight
          position={[6, 15, -4]}
          intensity={1.0}
          color="#fff0dc"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={40}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.001}
        />
        <directionalLight
          position={[-4, 12, 2]}
          intensity={0.25}
          color="#e8dfd4"
        />

        {/* Wood texture surface */}
        <Suspense fallback={null}>
          <LoadTracker onReady={handleSurfaceLoaded}>
            <DeskSurface />
          </LoadTracker>
        </Suspense>

        {/* 3D postcard back — center of desk, receives scene lighting */}
        <Suspense fallback={null}>
          <PostcardBack visible={!postcardClicked} />
        </Suspense>

        {/* Postcard + static envelope */}
        <DeskEnvelope
          animating={animating}
          onClick={handleEnvelopeClick}
          onArrived={onEnvelopeArrived}
          onHoverChange={onEnvelopeHover}
          onPostcardReady={() => setZooming(true)}
        />

        {/* Dolly zoom into postcard after it settles */}
        <CameraZoom
          active={zooming}
          onComplete={() => onPostcardReady?.()}
        />

        {/* Desk objects (GLB models) */}
        <Suspense fallback={null}>
          <LoadTracker onReady={handleObjectsLoaded}>
            <DeskObjects />
          </LoadTracker>
        </Suspense>
      </Canvas>
    </div>
  );
}
