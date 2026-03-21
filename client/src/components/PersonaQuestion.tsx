import "./OnboardingLayout.css";
import "./onboarding.css";

const OPTIONS = [
  "Excited — this is exactly what travel should feel like",
  "Fine, as long as we figure it out over breakfast",
  "Slightly anxious — I'd rather have had something loosely sketched out",
  "Stressed — I need a plan",
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PersonaQuestion({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="ob-card ob-card--full">
      <span className="ob-card__dot ob-card__dot--tl" />
      <span className="ob-card__dot ob-card__dot--tr" />
      <span className="ob-card__dot ob-card__dot--bl" />
      <span className="ob-card__dot ob-card__dot--br" />
      <span className="ob-card__inset" />

      <div className="ob-card__body">
<h2 className="ob-card__body-title">
          It's day two of the trip. Nothing is planned yet for today. You feel:
        </h2>

        <div className="ob-radio-group ob-form">
          {OPTIONS.map((opt) => (
            <label key={opt} className="ob-radio-option">
              <input
                type="radio"
                name="planningStyle"
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              <span className="ob-radio-option__label">{opt}</span>
            </label>
          ))}
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
