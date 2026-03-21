import { useEffect, useState } from "react";
import { api, type SessionStatus } from "../api";

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

  if (error) {
    return (
      <div className="card__content">
        <h2 className="heading">Something went wrong</h2>
        <p className="subtitle">{error}</p>
        <button className="form__button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="card__content">
      <h2 className="heading">{message}</h2>
      {subMessage && <p className="subtitle">{subMessage}</p>}
      <div className="spinner" />
    </div>
  );
}
