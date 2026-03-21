import { useState, useEffect } from "react";
import { api, type Option } from "../api";

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

  if (!result) {
    return (
      <div className="card__content">
        <h2 className="heading">Finding your perfect trip...</h2>
        <div className="spinner" />
      </div>
    );
  }

  return (
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
  );
}
