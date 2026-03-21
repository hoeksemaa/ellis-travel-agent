import { useState } from "react";
import bgLandscape from "../assets/bg-landscape.png";
import cardTexture from "../assets/card-texture.png";
import "../LandingPage.css";
import "./onboarding.css";

interface Props {
  onNext: (code: string) => void;
  onBack: () => void;
}

export default function JoinRoom({ onNext, onBack }: Props) {
  const [code, setCode] = useState("");

  function handleJoin() {
    if (code.trim()) {
      onNext(code.trim());
    }
  }

  return (
    <div className="landing">
      <div className="landing__bg">
        <img src={bgLandscape} alt="" />
      </div>

      <div className="card card--sm">
        <div className="card__texture">
          <img src={cardTexture} alt="" />
        </div>
        <span className="card__dot card__dot--tl" />
        <span className="card__dot card__dot--tr" />
        <span className="card__dot card__dot--bl" />
        <span className="card__dot card__dot--br" />
        <span className="card__border-inset" />

        <div className="modal-body">
          <p className="modal-body__title">Join a Room</p>

          <div className="ob-form">
            <div className="ob-form__group">
              <label className="ob-form__label">Room code</label>
              <input
                className="ob-form__input"
                type="text"
                placeholder="e.g. AZURE-342"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                autoFocus
              />
            </div>
          </div>

          <div className="ob-nav">
            <button className="ob-nav__prev" onClick={onBack} aria-label="Back">
              ←
            </button>
            <button
              className="ob-nav__next"
              onClick={handleJoin}
              disabled={!code.trim()}
              style={{ opacity: code.trim() ? 1 : 0.5 }}
            >
              Join ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
