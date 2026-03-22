import { useState, useEffect } from "react";
import { api, type Option } from "../api";
import bgLandscape from "../assets/bg-landscape.png";
import cardTexture from "../assets/card-texture.png";
import "../LandingPage.css";

interface ResultScreenProps {
  code: string;
}

export default function ResultScreen({ code }: ResultScreenProps) {
  const [result, setResult] = useState<Option | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const { result } = await api.getResult(code);
        if (active) setResult(result);
      } catch {
        // result not ready yet, try again
      }
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [code]);

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

        {!result ? (
          <div className="card__content">
            <h2 className="heading">Finding your perfect trip...</h2>
            <div className="spinner" />
          </div>
        ) : (
          <div className="card__content card__content--scroll">
            <h2 className="heading">You're going to</h2>
            <h1 className="result__name">{result.name}</h1>

            <div className="result__body">
              <p className="result__reason">{result.matchReason}</p>
              <div className="result__desc">
                {result.description.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
