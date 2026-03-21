import { useState, useEffect } from "react";
import { api, type Option, type UserVotes } from "../api";

interface VotingScreenProps {
  code: string;
  username: string;
  onDone: () => void;
}

export default function VotingScreen({ code, username, onDone }: VotingScreenProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<UserVotes>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getStatus(code).then(({ session }) => {
      if (session.options) {
        setOptions(session.options);
      }
    });
  }, [code]);

  function toggleVote(optionId: string) {
    setVotes((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  }

  async function handleSubmit() {
    const allVoted = options.every((o) => o.id in votes);
    if (!allVoted) {
      setError("Vote on all options before submitting.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.submitVotes(code, username, votes);
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (options.length === 0) {
    return (
      <div className="card__content">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="card__content card__content--scroll">
      <h2 className="heading">Vote on destinations</h2>
      <p className="subtitle">Thumbs up or down for each option.</p>

      <div className="vote-list">
        {options.map((opt) => (
          <div key={opt.id} className="vote-card">
            <div className="vote-card__info">
              <h3 className="vote-card__name">{opt.name}</h3>
              <p className="vote-card__desc">{opt.description}</p>
              <p className="vote-card__reason">{opt.matchReason}</p>
            </div>
            <button
              type="button"
              className={`vote-card__btn ${
                votes[opt.id] === true
                  ? "vote-card__btn--up"
                  : votes[opt.id] === false
                    ? "vote-card__btn--down"
                    : ""
              }`}
              onClick={() => toggleVote(opt.id)}
            >
              {votes[opt.id] === true ? "👍" : votes[opt.id] === false ? "👎" : "—"}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="form__error">{error}</p>}

      <button className="form__button" onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit votes"}
      </button>
    </div>
  );
}
