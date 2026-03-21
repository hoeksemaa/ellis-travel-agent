import { useState } from "react";
import bgLandscape from "../assets/bg-landscape.png";
import cardTexture from "../assets/card-texture.png";
import "../LandingPage.css";
import "./onboarding.css";

interface Props {
  onNewRoom: (username: string) => void;
  onJoinRoom: (username: string) => void;
  onBack: () => void;
}

export default function UsernameScreen({ onNewRoom, onJoinRoom, onBack }: Props) {
  const [username, setUsername] = useState("");
  const valid = username.trim().length > 0;

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
          <p className="modal-body__title">What's your username?</p>

          <div className="ob-form">
            <div className="ob-form__group">
              <label className="ob-form__label">Username</label>
              <input
                className="ob-form__input"
                type="text"
                placeholder="e.g. alex"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="ob-nav">
            <button className="ob-nav__prev" onClick={onBack} aria-label="Back">
              ←
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn--outline"
                onClick={() => valid && onJoinRoom(username.trim())}
                disabled={!valid}
                style={{ opacity: valid ? 1 : 0.5, fontSize: "14px", padding: "8px 18px" }}
              >
                Join Room
              </button>
              <button
                className="ob-nav__next"
                onClick={() => valid && onNewRoom(username.trim())}
                disabled={!valid}
                style={{ opacity: valid ? 1 : 0.5 }}
              >
                New Room ▶
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
