import { useState, type FormEvent } from "react";
import bgLandscape from "./assets/bg-landscape.png";
import cardTexture from "./assets/card-texture.png";
import "./LandingPage.css";

export default function LandingPage() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: wire up invite API
    console.log("invite:", email);
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

        {/* Decorative corner dots */}
        <span className="card__dot card__dot--tl" />
        <span className="card__dot card__dot--tr" />
        <span className="card__dot card__dot--bl" />
        <span className="card__dot card__dot--br" />

        {/* Decorative inset border */}
        <span className="card__border-inset" />

        <div className="card__content">
          <h1 className="brand">twopeople</h1>

          <p className="tagline">
            less arguing. more traveling.
            <br />
            twopeople handles the rest.
          </p>

          <form className="invite-form" onSubmit={handleSubmit}>
            <input
              className="invite-form__input"
              type="email"
              placeholder="email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="invite-form__button" type="submit">
              invite
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
