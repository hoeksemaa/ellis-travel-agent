import { useState, type FormEvent } from "react";
import { api } from "../api";

interface CreateJoinScreenProps {
  username: string;
  onSession: (code: string) => void;
}

export default function CreateJoinScreen({ username, onSession }: CreateJoinScreenProps) {
  const [mode, setMode] = useState<"choice" | "join">("choice");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      const { code } = await api.createSession(username);
      onSession(code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.joinSession(joinCode.trim().toUpperCase(), username);
      onSession(joinCode.trim().toUpperCase());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (mode === "join") {
    return (
      <div className="card__content">
        <h2 className="heading">Join a trip</h2>
        <p className="subtitle">Enter the code your partner shared.</p>

        <form className="form" onSubmit={handleJoin}>
          <input
            className="form__input form__input--code"
            type="text"
            placeholder="ABC123"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
            autoFocus
          />
          {error && <p className="form__error">{error}</p>}
          <button className="form__button" type="submit" disabled={loading}>
            {loading ? "Joining..." : "Join"}
          </button>
          <button className="form__link" type="button" onClick={() => { setMode("choice"); setError(""); }}>
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card__content">
      <h2 className="heading">Hi, {username}!</h2>
      <p className="subtitle">Ready to plan a trip together?</p>

      {error && <p className="form__error">{error}</p>}

      <div className="form" style={{ gap: "12px" }}>
        <button className="form__button" onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Start a new trip"}
        </button>
        <button className="form__button form__button--outline" onClick={() => setMode("join")} disabled={loading}>
          Join with a code
        </button>
      </div>
    </div>
  );
}
