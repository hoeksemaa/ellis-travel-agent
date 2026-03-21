import { useState, type FormEvent } from "react";

interface WelcomeScreenProps {
  onNext: (username: string) => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onNext(name.trim());
  }

  return (
    <div className="card__content">
      <h1 className="brand">twopeople</h1>
      <p className="tagline">
        less arguing. more traveling.
        <br />
        twopeople handles the rest.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <label className="form__label">
          <span className="form__label-text">What should we call you?</span>
          <input
            className="form__input"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>
        <button className="form__button" type="submit">
          Next
        </button>
      </form>
    </div>
  );
}
