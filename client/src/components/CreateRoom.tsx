import { useState } from "react";
import bgLandscape from "../assets/bg-landscape.png";
import cardTexture from "../assets/card-texture.png";
import "../LandingPage.css";
import "./onboarding.css";

interface Props {
  code: string;
  onNext: () => void;
  onBack: () => void;
}

export default function CreateRoom({ code, onNext, onBack }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

        <div className="modal-body">
          <p className="modal-body__title">Create a Room</p>

          <div className="ob-form">
            <div className="ob-form__group">
              <label className="ob-form__label">Room code</label>
              <div className="ob-code-row">
                <input value={code} readOnly aria-label="Room code" />
                <button
                  className={`ob-copy-btn${copied ? " ob-copy-btn--copied" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <div className="ob-nav">
            <button className="ob-nav__prev" onClick={onBack} aria-label="Back">
              ←
            </button>
            <button className="ob-nav__next" onClick={onNext}>
              Next ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
