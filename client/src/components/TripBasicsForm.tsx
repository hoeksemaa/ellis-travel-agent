import type { TripBasics } from "../App";
import "./OnboardingLayout.css";
import "./onboarding.css";

const DATE_RANGES = [
  "Select a range",
  "1–3 days",
  "4–7 days",
  "1–2 weeks",
  "2–4 weeks",
  "1+ month",
];

const RELATIONSHIPS = [
  "Select a range",
  "Partner / Spouse",
  "Best friend",
  "Friend",
  "Family member",
  "Colleague",
];

interface Props {
  data: TripBasics;
  onChange: (data: TripBasics) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TripBasicsForm({ data, onChange, onNext, onBack }: Props) {
  function set(field: keyof TripBasics, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="ob-card ob-card--full">
      <span className="ob-card__dot ob-card__dot--tl" />
      <span className="ob-card__dot ob-card__dot--tr" />
      <span className="ob-card__dot ob-card__dot--bl" />
      <span className="ob-card__dot ob-card__dot--br" />
      <span className="ob-card__inset" />

      <div className="ob-card__body">
        <p className="ob-progress">1/1</p>
        <h2 className="ob-card__body-title">Some basic details</h2>

        <div className="ob-form">
          <div className="ob-form__row">
            <div className="ob-form__group">
              <label className="ob-form__label">Country</label>
              <input
                className="ob-form__input"
                type="text"
                placeholder="e.g. Italy"
                value={data.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </div>
            <div className="ob-form__group">
              <label className="ob-form__label">City</label>
              <input
                className="ob-form__input"
                type="text"
                placeholder="e.g. Rome"
                value={data.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
          </div>

          <div className="ob-form__row">
            <div className="ob-form__group">
              <label className="ob-form__label">Travel dates</label>
              <div className="ob-form__select-wrap">
                <select
                  className="ob-form__select"
                  value={data.travelDates}
                  onChange={(e) => set("travelDates", e.target.value)}
                >
                  {DATE_RANGES.map((r) => (
                    <option key={r} value={r === "Select a range" ? "" : r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ob-form__group">
              <label className="ob-form__label">Relationship with travel buddy</label>
              <div className="ob-form__select-wrap">
                <select
                  className="ob-form__select"
                  value={data.relationship}
                  onChange={(e) => set("relationship", e.target.value)}
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r === "Select a range" ? "" : r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
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
  );
}
