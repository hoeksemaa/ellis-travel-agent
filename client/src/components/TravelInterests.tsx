import "./OnboardingLayout.css";
import "./onboarding.css";

const INTERESTS = [
  "Nature & Outdoors",
  "Arts & Performance",
  "Local Culture & Traditions",
  "Adventure & Sport",
  "Spiritual & Sacred Sites",
  "Classes & Workshops",
  "Food & Drink",
  "Nightlife & Social Scene",
  "City Life & Neighborhoods",
  "Other",
];

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TravelInterests({ selected, onChange, onNext, onBack }: Props) {
  function toggle(interest: string) {
    if (selected.includes(interest)) {
      onChange(selected.filter((i) => i !== interest));
    } else {
      onChange([...selected, interest]);
    }
  }

  return (
    <div className="ob-card ob-card--full">
      <span className="ob-card__dot ob-card__dot--tl" />
      <span className="ob-card__dot ob-card__dot--tr" />
      <span className="ob-card__dot ob-card__dot--bl" />
      <span className="ob-card__dot ob-card__dot--br" />
      <span className="ob-card__inset" />

      <div className="ob-card__body">
<h2 className="ob-card__body-title">Travel interests</h2>

        <div className="ob-chips ob-form">
          {INTERESTS.map((interest) => (
            <button
              key={interest}
              className={`ob-chip${selected.includes(interest) ? " ob-chip--active" : ""}`}
              onClick={() => toggle(interest)}
              type="button"
            >
              {interest}
            </button>
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
