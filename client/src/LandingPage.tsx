import { useState, useCallback, useEffect } from "react";
import DeskScene from "./components/three/DeskScene";
import "./LandingPage.css";

interface Props {
  onStart: () => void;
}

export default function LandingPage({ onStart }: Props) {
  const [sceneReady, setSceneReady] = useState(false);
  const [showPostcard, setShowPostcard] = useState(false);
  const [envelopeClicked, setEnvelopeClicked] = useState(false);
  const [envelopeHovered, setEnvelopeHovered] = useState(false);
  const [postcardDone, setPostcardDone] = useState(false);
  const [textReady, setTextReady] = useState(false);

  // Once scene is ready, wait a beat then show the postcard back
  useEffect(() => {
    if (!sceneReady) return;
    const timer = setTimeout(() => setShowPostcard(true), 400);
    return () => clearTimeout(timer);
  }, [sceneReady]);

  // After postcard fades in, show the "Start Planning" prompt
  useEffect(() => {
    if (!showPostcard) return;
    const timer = setTimeout(() => setTextReady(true), 1200);
    return () => clearTimeout(timer);
  }, [showPostcard]);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleEnvelopeClicked = useCallback(() => setEnvelopeClicked(true), []);
  const handleEnvelopeHover = useCallback((hovered: boolean) => setEnvelopeHovered(hovered), []);
  const handleEnvelopeArrived = useCallback(() => {}, []);

  const handlePostcardReady = useCallback(() => {
    setPostcardDone(true);
    // Flash takes ~1.5s to reach full white (75% of 2s),
    // then hold white for 0.7s before transitioning
    setTimeout(() => onStart(), 2200);
  }, [onStart]);

  return (
    <div className="landing landing--desk">
      <DeskScene
        onSceneReady={handleSceneReady}
        onEnvelopeClicked={handleEnvelopeClicked}
        onEnvelopeArrived={handleEnvelopeArrived}
        onEnvelopeHover={handleEnvelopeHover}
        onPostcardReady={handlePostcardReady}
        postcardClicked={envelopeClicked}
      />

      {/* Loading cover — matches wood tone, hides black flash. Removed from DOM once hidden. */}
      {!sceneReady && <div className="landing__loading" />}

      {/* CTA — points to the floating postcard */}
      <div
        className={`postcard-back__cta ${
          textReady && !envelopeHovered && !envelopeClicked ? "postcard-back__cta--visible" : ""
        }`}
      >
        <span>Click the postcard to start</span>
        <span className="postcard-back__cta-arrow">↑</span>
      </div>

      {postcardDone && <div className="landing__flash" />}
    </div>
  );
}
