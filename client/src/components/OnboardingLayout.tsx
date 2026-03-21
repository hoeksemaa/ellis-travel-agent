import type { ReactNode } from "react";
import bgLandscape from "../assets/bg-landscape.png";
import type { NavSection } from "../App";
import "./OnboardingLayout.css";
import "./onboarding.css";

interface Props {
  navSection: NavSection;
  children: ReactNode;
}

export default function OnboardingLayout({ navSection, children }: Props) {
  const tripsDone = navSection === "persona" || navSection === "preferences";
  const personaDone = navSection === "preferences";

  return (
    <div className="ob-layout">
      <div className="ob-layout__bg">
        <img src={bgLandscape} alt="" />
      </div>

      <div className="ob-topbar">
        <span className="ob-topbar__brand">twopeople</span>

        <div className="ob-topbar__tabs">
          <span
            className={`ob-tab${
              navSection === "trip-basics"
                ? " ob-tab--active"
                : tripsDone
                ? " ob-tab--done"
                : ""
            }`}
          >
            {tripsDone && "✓ "}Trips basics
          </span>
          <span
            className={`ob-tab${
              navSection === "persona"
                ? " ob-tab--active"
                : personaDone
                ? " ob-tab--done"
                : ""
            }`}
          >
            {personaDone && "✓ "}Persona
          </span>
          <span
            className={`ob-tab${navSection === "preferences" ? " ob-tab--active" : ""}`}
          >
            Your preferences
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
