import type { ReactNode } from "react";
import bgLandscape from "./assets/bg-landscape.png";
import cardTexture from "./assets/card-texture.png";
import "./LandingPage.css";

interface LandingPageProps {
  children: ReactNode;
  sessionCode?: string;
}

export default function LandingPage({ children, sessionCode }: LandingPageProps) {
  return (
    <div className="landing">
      <div className="landing__bg">
        <img src={bgLandscape} alt="" />
      </div>

      <div className="card">
        <div className="card__texture">
          <img src={cardTexture} alt="" />
        </div>

        <span className="card__dot card__dot--tl" />
        <span className="card__dot card__dot--tr" />
        <span className="card__dot card__dot--bl" />
        <span className="card__dot card__dot--br" />
        <span className="card__border-inset" />

        {sessionCode && (
          <span className="card__code-badge">{sessionCode}</span>
        )}

        {children}
      </div>
    </div>
  );
}
