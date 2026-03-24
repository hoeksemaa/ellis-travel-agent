import { Suspense } from "react";
import Scene3D from "./Scene3D";
import Envelope from "./Envelope";
import Surface from "./Surface";

/**
 * Standalone preview of the 3D envelope for testing/verification.
 * Renders the envelope centered on a shadow-receiving surface.
 * Can be dropped into any page to verify R3F is working.
 */
export default function EnvelopePreview() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Suspense fallback={null}>
        <Scene3D>
          <Envelope />
          <Surface />
        </Scene3D>
      </Suspense>
    </div>
  );
}
