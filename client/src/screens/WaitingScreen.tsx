import { useEffect, useState } from "react";
import { api, type SessionStatus } from "../api";
import bgLandscape from "../assets/bg-landscape.png";
import cardTexture from "../assets/card-texture.png";
import "../LandingPage.css";

interface WaitingScreenProps {
  code: string;
  targetStatus: SessionStatus | SessionStatus[];
  message: string;
  subMessage?: string;
  onReady: () => void;
}

export default function WaitingScreen({ code, targetStatus, message, subMessage, onReady }: WaitingScreenProps) {
  const [error, setError] = useState("");

  useEffect(() => {
    const targets = Array.isArray(targetStatus) ? targetStatus : [targetStatus];

    const interval = setInterval(async () => {
      try {
        const { session } = await api.getStatus(code);

        if (session.error) {
          setError(session.error);
          clearInterval(interval);
          return;
        }

        if (targets.includes(session.status)) {
          onReady();
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [code, targetStatus, onReady]);

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

        <div className="card__content">
          {error ? (
            <>
              <h2 className="heading">Something went wrong</h2>
              <p className="subtitle">{error}</p>
              <button className="form__button" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </>
          ) : (
            <>
              <h2 className="heading">{message}</h2>
              {subMessage && <p className="subtitle">{subMessage}</p>}
              <div className="spinner" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
